import { useState } from "react";
import { DS } from "../../utils/designSystem";
import Ico from '../../utils/icons';
import { Btn }        from '../../components/Btn';
import IconBtn from "../../components/Iconbtn";
import { Toggle }     from '../../components/Controls';
import { StatusBadge } from '../../components/Tag';


// Typography — confirmed from Figma
const TY = {
  h3: { fontSize: 20, fontWeight: 600, lineHeight: "28px" }, // Desktop/Headline/3_SB_28
  h4: { fontSize: 16, fontWeight: 600, lineHeight: "22px" },
  h5: { fontSize: 14, fontWeight: 600, lineHeight: "18px" },
  b1: { fontSize: 16, fontWeight: 400, lineHeight: "22px" }, // Desktop/Body/1_R_16
  b2: { fontSize: 14, fontWeight: 400, lineHeight: "18px" }, // Desktop/Body/2_R_14
  b3: { fontSize: 12, fontWeight: 400, lineHeight: "16px" }, // Desktop/Body/3_R_12
};

// ─── Mock Data ────────────────────────────────────────────────────────────────
const FORMS = [
  { id:1, name:"Newsletter Sign-up", description:"Subscribe new contacts to the weekly newsletter and update their preferences.", type:"standard", status:"active", created:"10 Apr 2025", updated:"21 May 2026", updatedBy:"System", contacts:85, sent:132, pages:1 },
  { id:2, name:"Partner Activation Form", description:"Qualify incoming B2B partners and route them to the right sales segment.", type:"standard", status:"active", created:"28 Apr 2026", updated:"2 May 2026", updatedBy:"Guillaume Grancourt", contacts:37, sent:106, pages:2 },
  { id:3, name:"Win a VIP Experience", description:"Contest entry form for fans to win an exclusive backstage VIP pass.", type:"standard", status:"active", created:"15 Mar 2026", updated:"30 Mar 2026", updatedBy:"Guillaume Grancourt", contacts:7, sent:121, pages:3 },
  { id:4, name:"Win the Goalkeeper Jersey RS!", description:"Season-end giveaway to boost engagement and collect supporter data.", type:"standard", status:"active", created:"5 Aug 2025", updated:"30 Oct 2025", updatedBy:"System", contacts:1891, sent:3102, pages:2 },
  { id:5, name:"Win Your Tickets to the Secret Night!", description:"Pre-event acquisition form for the Nuits Secrètes festival audience.", type:"standard", status:"active", created:"17 Jun 2025", updated:"28 Oct 2025", updatedBy:"System", contacts:406, sent:644, pages:3 },
  { id:6, name:"Newsletter Sign-up Push", description:"Pop-up overlay for the club website to capture newsletter opt-ins.", type:"popup", status:"inactive", created:"24 Oct 2025", updated:"24 Oct 2025", updatedBy:"System", contacts:0, sent:0, pages:1 },
  { id:7, name:"Win the Goalkeeper Jersey MAIL!", description:"Email-triggered version of the jersey giveaway for CRM re-engagement.", type:"standard", status:"active", created:"18 Aug 2025", updated:"23 Oct 2025", updatedBy:"System", contacts:101, sent:907, pages:2 },
  { id:8, name:"Copy of Win Your Tickets to the Secret Night!", description:"Duplicate of the Secret Night form — pending update for next edition.", type:"standard", status:"inactive", created:"5 Aug 2025", updated:"5 Aug 2025", updatedBy:"System", contacts:0, sent:0, pages:2 },
];
const cr = f => f.sent > 0 ? Math.round(f.contacts / f.sent * 100) : 0;

// TypeBadge — form type tag. From Figma Tags node 196:1978: Default = bg #EFF4FF, border #0D69D4, text #0D69D4
function TypeBadge({ label }) {
  return (
    <span style={{ background: DS.blue100, border:`1px solid ${DS.blue600}`, color: DS.blue600, borderRadius:10, padding:"3px 8px", ...TY.b3, fontFamily:DS.ff }}>
      {label}
    </span>
  );
}

// IconBadge — from Figma CardStats: bg #EFF4FF, borderRadius 6, size 28, icon 20
function IconBadge({ icon: IcoC, iconColor }) {
  return (
    <div style={{ background: DS.bgIcons, borderRadius:6, width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      {IcoC && <IcoC s={16} c={iconColor || DS.actionPrimary} />}
    </div>
  );
}


// CardStats — from Figma 218:1575 / 220:1603
// title: b1 (16px/400) in #E2DDDD (very light — acts as muted label)
// value: h3 (20px/600) in textDefault #1F2937
// subvalue: b2 (14px/400) in neutral500 #9A9EA5
// Icon badge top-right: bg #EFF4FF, borderRadius 6, size 28
function CardStats({ title, value, subvalue, icon: IcoC, iconColor, trend, trendVal }) {
  return (
    <div style={{ background:DS.bgCard, border:`1px solid ${DS.borderDefault}`, borderRadius:10, padding:16, flex:1, minWidth:0, display:"flex", flexDirection:"column", gap:4 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:2 }}>
        <span style={{ ...TY.b1, color:DS.neutral200, fontFamily:DS.ff, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:"70%" }}>{title}</span>
        {IcoC && <IconBadge icon={IcoC} iconColor={iconColor}/>}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:5, alignItems:"flex-start" }}>
        <span style={{ ...TY.h3, color:DS.textDefault, fontFamily:DS.ff }}>{value}</span>
        {subvalue && <span style={{ ...TY.b2, color:DS.neutral500, fontFamily:DS.ff }}>{subvalue}</span>}
      </div>
      {trend && (
        <div style={{ display:"flex", alignItems:"center", gap:4, marginTop:4 }}>
          {trend === "up"   ? <Ico.TrendUp s={12} c={DS.feedbackSuccess}/> : <Ico.TrendDown s={12} c={DS.feedbackError}/>}
          <span style={{ ...TY.b3, color: trend === "up" ? DS.feedbackSuccess : DS.feedbackError, fontFamily:DS.ff }}>{trendVal}</span>
        </div>
      )}
    </div>
  );
}

// PageHeader — from Figma 360:1403
function PageHeader({ title, subtitle, icon: IcoC, actions }) {
  return (
    <div style={{ background:DS.bgCard, borderBottom:`1px solid ${DS.borderDefault}`, padding:"16px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
      <div style={{ display:"flex", alignItems:"center", gap:16 }}>
        {IcoC && (
          <div style={{ background:DS.bgIcons, borderRadius:6, width:40, height:40, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <IcoC s={20} c={DS.actionPrimary}/>
          </div>
        )}
        <div>
          <div style={{ ...TY.h3, color:DS.textDefault, fontFamily:DS.ff, lineHeight:"28px" }}>{title}</div>
          {subtitle && <div style={{ ...TY.b2, color:DS.neutral500, fontFamily:DS.ff }}>{subtitle}</div>}
        </div>
      </div>
      {actions && <div style={{ display:"flex", gap:16, alignItems:"center" }}>{actions}</div>}
    </div>
  );
}

// TabBar — from Figma 196:2034. Active: text #017BFE, bar bg #007AFF 4px
function TabBar({ tabs, active, onChange, extra }) {
  return (
    <div style={{ background:DS.bgCard, borderBottom:`1px solid ${DS.borderDefault}`, padding:"0 24px", display:"flex", alignItems:"center" }}>
      {tabs.map(t => {
        const isActive = t.id === active;
        const IcoC = t.icon;
        return (
          <button key={t.id} onClick={() => onChange(t.id)}
            style={{ height:48, padding:"0 16px", border:"none", borderBottom: isActive ? `4px solid ${DS.navTabBarActive}` : "4px solid transparent", background:"transparent", cursor:"pointer", display:"flex", alignItems:"center", gap:8, ...TY.b2, fontFamily:DS.ff, color: isActive ? DS.navTabTextActive : DS.navText, fontWeight: isActive ? 600 : 400, transition:"color .15s" }}>
            {IcoC && <IcoC s={14} c={isActive ? DS.navTabTextActive : DS.textSecondary}/>}
            {t.label}
          </button>
        );
      })}
      {extra && <div style={{ marginLeft:"auto" }}>{extra}</div>}
    </div>
  );
}

// MiniDonutChart — pure SVG donut for Results
function DonutChart({ pct, color, size=80, stroke=10 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct / 100;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={DS.bgSurface} strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color || DS.actionPrimary} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}/>
      <text x={size/2} y={size/2+1} textAnchor="middle" dominantBaseline="middle" style={{ fontSize:14, fontWeight:600, fill:DS.textDefault, fontFamily:DS.ff }}>{pct}%</text>
    </svg>
  );
}

// BarChart — simple horizontal bars
function HBarChart({ data, colorFn }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      {data.map((d, i) => (
        <div key={i}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
            <span style={{ ...TY.b3, color:DS.textDefault, fontFamily:DS.ff }}>{d.label}</span>
            <span style={{ ...TY.b3, color:DS.textSecondary, fontFamily:DS.ff, fontWeight:600 }}>{d.value.toLocaleString()}</span>
          </div>
          <div style={{ height:8, background:DS.bgSurface, borderRadius:4, overflow:"hidden" }}>
            <div style={{ height:"100%", width:max > 0 ? Math.round(d.value/max*100)+"%" : "0%", background: colorFn ? colorFn(d, i) : DS.actionPrimary, borderRadius:4, transition:"width .5s" }}/>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── SCREEN 1: Forms Overview ─────────────────────────────────────────────────
function FormsOverview({ onOpen, onCreate }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const filtered = FORMS.filter(f =>
    (filter === "all" || f.status === filter) &&
    (search === "" || f.name.toLowerCase().includes(search.toLowerCase()))
  );
  const active = FORMS.filter(f => f.status === "active");
  const totalResp = FORMS.reduce((a, f) => a + f.contacts, 0);
  const totalSent = FORMS.reduce((a, f) => a + f.sent, 0);
  const avgCR = active.length > 0 ? Math.round(active.reduce((a, f) => a + cr(f), 0) / active.length) : 0;
  const newResp = Math.round(totalResp * 0.12);

  return (
    <div style={{ background:DS.bgPage, minHeight:"100vh" }}>
      <PageHeader title="ArenaForm" subtitle={`${FORMS.length} forms`} icon={Ico.Form}
        actions={<><Btn type="Primary" iconLeft={<Ico.Plus s={16} c={DS.textInverse}/>} onClick={onCreate}>Create new form</Btn></>}/>

      {/* KPI strip — 4 cards */}
      <div style={{ padding:"24px 24px 0", display:"flex", gap:16 }}>
        <CardStats title="Total responses" value="2 527" subvalue="out of 5 012 sent" icon={Ico.Responses} trend="up" trendVal="+324 vs last month"/>
        <CardStats title="Avg. completion" value="40%" subvalue="active forms only" icon={Ico.Donut}/>
        <CardStats title="Active forms" value={active.length} subvalue={`${FORMS.length-active.length} inactive`} icon={Ico.Check} iconColor={DS.feedbackSuccess}/>
        <CardStats title="New responses" value="+303" subvalue="last 7 days" icon={Ico.TrendUp} iconColor={DS.feedbackSuccess} trend="up" trendVal="vs previous week"/>
      </div>

      {/* Toolbar — flat on bgPage, no card wrapper */}
      <div style={{ padding:"16px 24px 12px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
        {/* Status filter — segmented control */}
        <div style={{ display:"flex", gap:2, background:DS.bgSurface, borderRadius:6, padding:2, border:`1px solid ${DS.borderDefault}` }}>
          {["all","active","inactive"].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              style={{ padding:"5px 14px", borderRadius:4, border:"none", cursor:"pointer", background: filter===s ? DS.bgCard : "transparent", color: filter===s ? DS.textDefault : DS.textSecondary, fontFamily:DS.ff, ...TY.b2, fontWeight: filter===s ? 600 : 400, boxShadow: filter===s ? "0 1px 2px rgba(0,0,0,0.06)" : "none", transition:"all .15s" }}>
              {s==="all" ? `All (${FORMS.length})` : s==="active" ? `Active (${active.length})` : `Inactive (${FORMS.filter(f=>f.status==="inactive").length})`}
            </button>
          ))}
        </div>
        {/* Search input — from Figma 196:1333, h:40, bg:#F9FBFB, border:#E2DDDD, borderRadius:4, px:12 */}
        <div style={{ position:"relative" }}>
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", display:"flex", alignItems:"center" }}>
            <svg width={16} height={16} viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="6" stroke={DS.textSecondary} strokeWidth="1.5"/><path d="M13.5 13.5l3 3" stroke={DS.textSecondary} strokeWidth="1.5" strokeLinecap="round"/></svg>
          </span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…"
            style={{ height:40, border:`1px solid ${search ? DS.borderFocus : DS.borderDefault}`, borderRadius: 6, padding:"8px 12px 8px 36px", fontFamily:DS.ff, ...TY.b2, color:DS.textDefault, background:DS.bgSurface, outline:"none", width:220, transition:"border-color .15s" }}/>
        </div>
      </div>

      {/* Banner list — no wrapping card, banners float on bgPage */}
      <div style={{ padding:"0 24px", display:"flex", flexDirection:"column", gap:8 }}>
        {filtered.length === 0 ? (
          <div style={{ background:DS.bgCard, border:`1px solid ${DS.borderDefault}`, borderRadius: 10, padding:48, textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
            <Ico.Form s={32} c={DS.neutral500}/>
            <div style={{ ...TY.h5, color:DS.textDefault, fontFamily:DS.ff }}>No forms found</div>
            <div style={{ ...TY.b2, color:DS.textSecondary, fontFamily:DS.ff }}>Try adjusting your filters or search.</div>
          </div>
        ) : filtered.map((f, i) => <FormBanner key={f.id} form={f} last={i===filtered.length-1} onOpen={()=>onOpen(f)}/>)}
      </div>
    </div>
  );
}

// ─── Banner component — from Figma node 418:1399 ─────────────────────────────
// Container: bg white, border 1px #E2DDDD, borderRadius 8, padding 24, gap 48, flex row, alignItems center
// BannerHead: icon-badge (40×40, bg #EFF4FF, borderRadius 6) + Item (label h5/SB/#1F2937 + sublabel b3/R/#9A9EA5)
// Item columns: uppercase label h5/SB/#9A9EA5 on top, value b3/R/#1F2937 with optional icon bottom
// CONTACTS column: value h5/SB/#1F2937 (heavier weight, confirmed from Figma)
// Action: Secondary icon button 36×36, border #017BFE, vertical dots icon
function BannerItem({ label, value, icon: IcoC, valueWeight, stretch }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:4, padding:"4px 0", flex: stretch ? 1 : "0 0 auto", minWidth:0 }}>
      {/* Column label — uppercase, h5/SB/#9A9EA5 */}
      <span style={{ ...TY.h5, color:DS.textSecondary, fontFamily:DS.ff, textTransform:"uppercase", whiteSpace:"nowrap" }}>{label}</span>
      {/* Column value */}
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        {IcoC && <IcoC s={16} c={DS.textSecondary}/>}
        <span style={{ ...(valueWeight === "bold" ? TY.h5 : TY.b3), color:DS.textDefault, fontFamily:DS.ff, whiteSpace:"nowrap" }}>{value}</span>
      </div>
    </div>
  );
}

function FormBanner({ form, last, onOpen }) {
  const [hov, setHov] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const rate = cr(form);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setMenuOpen(false); }}
      onClick={onOpen}
      style={{
        background: hov ? DS.bgSurface : DS.bgCard,
        border: `1px solid ${DS.borderDefault}`,
        borderRadius: 10,
        padding: 24,
        display: "flex",
        alignItems: "center",
        gap: 48,
        cursor: "pointer",
        transition: "background .12s",
      }}
    >
      {/* BannerHead — icon badge + name/sublabel — flex:2 to take double column width */}
      <div style={{ display:"flex", gap:16, alignItems:"flex-start", flex:2, minWidth:0 }}>
        {/* Icon-badge: 40×40, bg #EFF4FF, borderRadius 6 */}
        <div style={{ width:40, height:40, background:DS.bgIcons, borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <Ico.Form s={20} c={DS.actionPrimary}/>
        </div>
        {/* Item: name + status badge on same row, description below */}
        <div style={{ display:"flex", flexDirection:"column", gap:4, padding:"4px 0", minWidth:0, flex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ ...TY.h5, color:DS.textDefault, fontFamily:DS.ff, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{form.name}</span>
            <StatusBadge status={form.status === "active" ? "success" : "inactive"}>{form.status === "active" ? "Active" : "Inactive"}</StatusBadge>
          </div>
          <span style={{ ...TY.b3, color:DS.textSecondary, fontFamily:DS.ff, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{form.description}</span>
        </div>
      </div>

      {/* CHANNEL column */}
      <BannerItem
        label="Channel"
        value={form.type === "popup" ? "Pop-up" : "Email / URL"}
        icon={form.type === "popup" ? Ico.Form : Ico.Mail}
        stretch
      />

      {/* CREATED DATE column */}
      <BannerItem
        label="Created date"
        value={form.created}
        icon={Ico.Calendar}
        stretch
      />

      {/* UPDATED column */}
      <BannerItem
        label="Last updated"
        value={form.updated}
        icon={Ico.Calendar}
        stretch
      />

      {/* RESPONSES column */}
      <BannerItem
        label="Responses"
        value={form.contacts.toLocaleString()}
        valueWeight="bold"
        stretch
      />

      {/* Action — Secondary icon button 36×36 with vertical dots, from Figma 418:2394 */}
      <div style={{ position:"relative" }}>
        <button
          onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); }}
          style={{ width:36, height:36, border:`1px solid ${DS.actionSecondaryBorder}`, borderRadius:6, background:DS.bgCard, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <Ico.Dots s={20} c={DS.actionPrimary}/>
        </button>
        {menuOpen && (
          <div onClick={e=>e.stopPropagation()} style={{ position:"absolute", right:0, top:40, background:DS.bgCard, border:`1px solid ${DS.borderDefault}`, borderRadius:4, boxShadow:"0 2px 8px rgba(0,0,0,0.10)", zIndex:10, minWidth:140 }}>
            {[{label:"Open",icon:Ico.Eye},{label:"Duplicate",icon:Ico.Copy},{label:"Delete",icon:Ico.Trash}].map(({label,icon:IcoC})=>(
              <button key={label} onClick={e=>{e.stopPropagation();if(label==="Open")onOpen();setMenuOpen(false);}}
                style={{ width:"100%", padding:"10px 14px", border:"none", background:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:10, ...TY.b2, fontFamily:DS.ff, color: label==="Delete" ? DS.feedbackError : DS.textDefault, textAlign:"left" }}>
                <IcoC s={14} c={label==="Delete" ? DS.feedbackError : DS.textSecondary}/>{label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SCREEN 2: Form Editor (shared shell) ────────────────────────────────────
const EDITOR_TABS = [
  { id:"builder",  label:"Builder",  icon:Ico.Form },
  { id:"workflow", label:"Workflow", icon:Ico.Workflow },
  { id:"connect",  label:"Connect",  icon:Ico.Connect },
  { id:"results",  label:"Results",  icon:Ico.Chart },
];

function FormEditor({ form, isNew, onBack }) {
  const [tab, setTab] = useState("results"); // Default to results so it renders rich
  const [step, setStep] = useState(isNew ? 0 : 3);

  return (
    <div style={{ background:DS.bgPage, minHeight:"100vh", display:"flex", flexDirection:"column" }}>
      {/* Breadcrumb */}
      <div style={{ background:DS.bgCard, padding:"8px 24px", borderBottom:`1px solid ${DS.borderDefault}`, display:"flex", alignItems:"center", gap:8 }}>
        <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", cursor:"pointer", color:DS.actionPrimary, fontFamily:DS.ff, ...TY.b3 }}>
          <Ico.ChevLeft s={14} c={DS.actionPrimary}/>Back to forms
        </button>
        <span style={{ ...TY.b3, color:DS.borderDefault }}>/</span>
        <span style={{ ...TY.b3, color:DS.textSecondary, fontFamily:DS.ff }}>{form ? form.name : "New form"}</span>
      </div>
      <PageHeader
        title={form ? form.name : "New Form"}
        subtitle={form ? `${form.type==="popup"?"Pop-up":"Standard"} · Last updated ${form.updated}` : "Creating new form"}
        icon={Ico.Form}
        actions={<><Btn type="Secondary" onClick={()=>{}}>Save draft</Btn><Btn type="Primary" onClick={()=>{}}>Publish</Btn></>}
      />
      <TabBar tabs={EDITOR_TABS} active={tab} onChange={t => { if (!isNew || EDITOR_TABS.findIndex(x=>x.id===t) <= step) setTab(t); }}
        extra={isNew && step < 3 ? <Btn type="Primary" size="Small" iconLeft={<Ico.ChevRight s={14} c={DS.textInverse}/>} onClick={()=>{ const n=step+1; setStep(n); setTab(EDITOR_TABS[n].id); }}>Next step</Btn> : null}/>
      <div style={{ flex:1, overflow:"auto" }}>
        {tab === "builder"  && <BuilderTab form={form}/>}
        {tab === "workflow" && <WorkflowTab/>}
        {tab === "connect"  && <ConnectTab form={form}/>}
        {tab === "results"  && <ResultsTab form={form}/>}
      </div>
    </div>
  );
}

// ─── Builder Tab ──────────────────────────────────────────────────────────────
const FIELD_LIB = [
  {type:"text",label:"Short text"},{type:"email",label:"Email"},{type:"select",label:"Dropdown"},
  {type:"multiselect",label:"Multi-select"},{type:"date",label:"Date"},{type:"rating",label:"Rating (1–5)"},
  {type:"textarea",label:"Long text"},{type:"phone",label:"Phone"},
];
const INIT_FIELDS = [
  {id:"f1",type:"text",  label:"First name",    crm:"contact.first_name",required:true},
  {id:"f2",type:"email", label:"Email address",  crm:"contact.email",     required:true},
  {id:"f3",type:"select",label:"I am interested in…",crm:"contact.interest",required:false},
  {id:"f4",type:"text",  label:"My very long custom field label that might get truncated in the layout",crm:null,required:false},
];

function BuilderTab({ form }) {
  const [fields] = useState(INIT_FIELDS);
  const [activeField, setActiveField] = useState(null);
  const [accent, setAccent] = useState("#017BFE");
  const [title, setTitle] = useState(form ? form.name : "My Form");
  const [showWarn, setShowWarn] = useState(true);
  const unmapped = fields.filter(f=>!f.crm).length;

  return (
    <div style={{ display:"flex", height:"calc(100vh - 185px)", overflow:"hidden" }}>
      {/* Left sidebar */}
      <div style={{ width:216, background:DS.bgCard, borderRight:`1px solid ${DS.borderDefault}`, display:"flex", flexDirection:"column", flexShrink:0 }}>
        <div style={{ padding:"12px 16px", borderBottom:`1px solid ${DS.borderDefault}` }}>
          <div style={{ ...TY.h5, color:DS.textDefault, fontFamily:DS.ff }}>Field library</div>
          <div style={{ ...TY.b3, color:DS.textSecondary, fontFamily:DS.ff, marginTop:2 }}>CRM-mapped fields</div>
        </div>
        <div style={{ flex:1, overflow:"auto" }}>
          {FIELD_LIB.map(f => (
            <div key={f.type} style={{ padding:"9px 16px", display:"flex", alignItems:"center", gap:10, cursor:"grab", borderBottom:`1px solid ${DS.borderDefault}` }}>
              <Ico.Drag s={12} c={DS.neutral500}/>
              <Ico.Field s={14} c={DS.textSecondary}/>
              <span style={{ ...TY.b3, color:DS.textDefault, fontFamily:DS.ff }}>{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div style={{ flex:1, background:DS.bgPage, overflow:"auto", padding:24, display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
        {unmapped > 0 && showWarn && (
          <div style={{ background:DS.feedbackWarningBg, border:`1px solid ${DS.feedbackWarning}`, borderRadius:10, padding:"10px 16px", display:"flex", alignItems:"center", gap:10, width:"100%", maxWidth:540 }}>
            <Ico.Warn s={16} c={DS.feedbackWarning}/>
            <span style={{ ...TY.b3, color:DS.feedbackWarning, fontFamily:DS.ff, flex:1 }}>{unmapped} field{unmapped>1?"s are":" is"} not mapped to CRM. Publishing blocked until resolved.</span>
            <button onClick={()=>setShowWarn(false)} style={{ background:"none", border:"none", cursor:"pointer", padding:0 }}><Ico.Cross s={14} c={DS.feedbackWarning}/></button>
          </div>
        )}
        <div style={{ background:DS.bgCard, border:`1px solid ${DS.borderDefault}`, borderRadius:10, width:"100%", maxWidth:540, overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ background:accent, padding:"20px 24px" }}>
            <div style={{ ...TY.h3, color:"#fff", fontFamily:DS.ff }}>{title}</div>
            <div style={{ ...TY.b3, color:"rgba(255,255,255,0.75)", fontFamily:DS.ff, marginTop:4 }}>Page 1 of {form?.pages||1}</div>
          </div>
          <div style={{ padding:"20px 24px", display:"flex", flexDirection:"column", gap:12 }}>
            {fields.map(f => (
              <div key={f.id} onClick={()=>setActiveField(f.id===activeField?null:f.id)}
                style={{ border:`1.5px solid ${activeField===f.id ? DS.borderFocus : DS.borderDefault}`, borderRadius:6, padding:"10px 12px", cursor:"pointer", background: activeField===f.id ? DS.feedbackInfoBg : DS.bgCard, transition:"all .12s" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4, alignItems:"center" }}>
                  <span style={{ ...TY.b3, color:DS.textSecondary, fontFamily:DS.ff, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:260 }}>
                    {f.label}{f.required && <span style={{ color:DS.feedbackError, marginLeft:2 }}>*</span>}
                  </span>
                  <div style={{ display:"flex", gap:6 }}>
                    {!f.crm && <Ico.Warn s={12} c={DS.feedbackWarning}/>}
                    <span style={{ ...TY.b3, color:DS.textSecondary, fontFamily:DS.ff, background:DS.bgSurface, border:`1px solid ${DS.borderDefault}`, borderRadius:3, padding:"1px 5px" }}>{f.type}</span>
                  </div>
                </div>
                <div style={{ height:32, border:`1px solid ${DS.borderDefault}`, borderRadius:4, background:DS.bgSurface, display:"flex", alignItems:"center", padding:"0 10px" }}>
                  <span style={{ ...TY.b3, color:DS.textPlaceholder, fontFamily:DS.ff }}>{f.type==="select"?"Select an option…":"Enter value…"}</span>
                </div>
                {f.crm && <div style={{ ...TY.b3, color:DS.teal500, fontFamily:DS.ff, marginTop:4, display:"flex", alignItems:"center", gap:4 }}><Ico.CRM s={10} c={DS.teal500}/>{f.crm}</div>}
              </div>
            ))}
            <button style={{ border:`2px dashed ${DS.borderDefault}`, borderRadius:6, padding:12, background:"none", cursor:"pointer", color:DS.textSecondary, fontFamily:DS.ff, ...TY.b2, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              <Ico.Plus s={14} c={DS.textSecondary}/>Drop a field here
            </button>
          </div>
        </div>
        <Btn type="Secondary" size="Small" iconLeft={<Ico.Plus s={14} c={DS.actionPrimary}/>} onClick={()=>{}}>Add page</Btn>
      </div>

      {/* Right: Design */}
      <div style={{ width:232, background:DS.bgCard, borderLeft:`1px solid ${DS.borderDefault}`, overflow:"auto", flexShrink:0 }}>
        <div style={{ padding:"12px 16px", borderBottom:`1px solid ${DS.borderDefault}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ ...TY.h5, color:DS.textDefault, fontFamily:DS.ff }}>Design</span>
          <Ico.Paint s={14} c={DS.actionPrimary}/>
        </div>
        <div style={{ padding:16, display:"flex", flexDirection:"column", gap:16 }}>
          <div>
            <div style={{ ...TY.b3, color:DS.textSecondary, fontFamily:DS.ff, marginBottom:6 }}>Form title</div>
            <input value={title} onChange={e=>setTitle(e.target.value)} style={{ width:"100%", height:36, border:`1px solid ${DS.borderDefault}`, borderRadius:4, padding:"0 10px", fontFamily:DS.ff, ...TY.b2, color:DS.textDefault, background:DS.bgSurface, outline:"none", boxSizing:"border-box" }}/>
          </div>
          <div>
            <div style={{ ...TY.b3, color:DS.textSecondary, fontFamily:DS.ff, marginBottom:6 }}>Accent colour</div>
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <input type="color" value={accent} onChange={e=>setAccent(e.target.value)} style={{ width:32, height:32, border:`1px solid ${DS.borderDefault}`, borderRadius:4, cursor:"pointer", padding:2 }}/>
              <span style={{ ...TY.b3, color:DS.textDefault, fontFamily:DS.ff }}>{accent}</span>
            </div>
          </div>
          <div>
            <div style={{ ...TY.b3, color:DS.textSecondary, fontFamily:DS.ff, marginBottom:6 }}>Logo</div>
            <button style={{ width:"100%", border:`2px dashed ${DS.borderDefault}`, borderRadius:6, padding:12, background:"none", cursor:"pointer", color:DS.textSecondary, fontFamily:DS.ff, ...TY.b3, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
              <Ico.Plus s={12} c={DS.textSecondary}/>Upload logo
            </button>
          </div>
          <div style={{ borderTop:`1px solid ${DS.borderDefault}`, paddingTop:16 }}>
            <div style={{ background:DS.feedbackInfoBg, border:`1px solid ${DS.feedbackInfo}`, borderRadius:6, padding:"8px 10px", display:"flex", gap:8 }}>
              <Ico.Workflow s={14} c={DS.feedbackInfo}/>
              <span style={{ ...TY.b3, color:DS.feedbackInfo, fontFamily:DS.ff }}>Conditional logic (show/hide, skip page) lives in the Workflow tab.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Workflow Tab ─────────────────────────────────────────────────────────────
function WorkflowTab() {
  const nodes = [
    {id:"trigger",x:40, y:190,type:"trigger",  label:"Form submitted",      sub:"Trigger"},
    {id:"c1",     x:240,y:130,type:"condition", label:'IF interest = "VIP"', sub:"IF Condition"},
    {id:"c2",     x:240,y:250,type:"condition", label:"ELSE",                sub:"ELSE Branch"},
    {id:"a1",     x:440,y:90, type:"action",    label:"Show VIP field",      sub:"Show/Hide field"},
    {id:"a2",     x:440,y:170,type:"action",    label:"Skip to page 3",      sub:"Skip page"},
    {id:"a3",     x:440,y:270,type:"action",    label:"Update CRM field",    sub:"CRM sync"},
    {id:"a4",     x:440,y:340,type:"action",    label:"Send confirmation",   sub:"Email action"},
  ];
  const edges = [
    {from:"trigger",to:"c1"},{from:"trigger",to:"c2"},
    {from:"c1",to:"a1"},{from:"c1",to:"a2"},{from:"c2",to:"a3"},{from:"c2",to:"a4"},
  ];
  const [sel, setSel] = useState(null);
  const W=160, H=52, svgW=660, svgH=450;
  const nx=id=>{const n=nodes.find(n=>n.id===id);return n?n.x+W/2:0;};
  const ny=id=>{const n=nodes.find(n=>n.id===id);return n?n.y+H/2:0;};
  const ts={
    trigger:  {bg:DS.feedbackInfoBg,  border:DS.actionPrimary},
    condition:{bg:DS.feedbackWarningBg,border:DS.feedbackWarning},
    action:   {bg:DS.feedbackSuccessBg,border:DS.feedbackSuccess},
  };
  return (
    <div style={{ background:DS.bgPage, padding:24, height:"calc(100vh - 185px)", overflow:"auto" }}>
      <div style={{ background:DS.bgCard, border:`1px solid ${DS.borderDefault}`, borderRadius:10, overflow:"hidden" }}>
        <div style={{ padding:"12px 16px", borderBottom:`1px solid ${DS.borderDefault}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ ...TY.h5, color:DS.textDefault, fontFamily:DS.ff }}>Workflow canvas</div>
            <div style={{ ...TY.b3, color:DS.textSecondary, fontFamily:DS.ff, marginTop:2 }}>IF/ELSE · AND/OR · CRM sync · Email</div>
          </div>
          <div style={{ display:"flex", gap:6 }}>
            {[{bg:ts.trigger.bg,border:ts.trigger.border,l:"Trigger"},{bg:ts.condition.bg,border:ts.condition.border,l:"Condition"},{bg:ts.action.bg,border:ts.action.border,l:"Action"}].map(x=>(
              <span key={x.l} style={{ ...TY.b3, fontFamily:DS.ff, background:x.bg, border:`1px solid ${x.border}`, borderRadius:4, padding:"3px 8px", color:DS.textDefault }}>{x.l}</span>
            ))}
          </div>
        </div>
        <div style={{ overflow:"auto" }}>
          <svg width={svgW} height={svgH} style={{ display:"block" }}>
            <defs><marker id="arw" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0 0L8 4L0 8z" fill={DS.borderDefault}/></marker></defs>
            {edges.map((e,i)=>{
              const x1=nx(e.from),y1=ny(e.from),x2=nx(e.to),y2=ny(e.to),cx=(x1+x2)/2;
              return <path key={i} d={`M${x1} ${y1} C${cx} ${y1} ${cx} ${y2} ${x2} ${y2}`} stroke={DS.borderDefault} strokeWidth="1.5" fill="none" markerEnd="url(#arw)"/>;
            })}
            {nodes.map(n=>{
              const s=ts[n.type]; const active=sel===n.id;
              return (
                <g key={n.id} onClick={()=>setSel(active?null:n.id)} style={{ cursor:"pointer" }}>
                  <rect x={n.x} y={n.y} width={W} height={H} rx="8" fill={s.bg} stroke={active?DS.actionPrimary:s.border} strokeWidth={active?2:1.5}/>
                  <text x={n.x+12} y={n.y+17} style={{ fontSize:9, fill:DS.textSecondary, fontFamily:DS.ff }}>{n.sub}</text>
                  <text x={n.x+12} y={n.y+35} style={{ fontSize:11, fill:DS.textDefault, fontFamily:DS.ff, fontWeight:600 }}>{n.label}</text>
                </g>
              );
            })}
          </svg>
        </div>
        <div style={{ padding:"12px 16px", borderTop:`1px solid ${DS.borderDefault}`, display:"flex", gap:8 }}>
          <Btn type="Secondary" size="Small" iconLeft={<Ico.Plus s={14} c={DS.actionPrimary}/>} onClick={()=>{}}>Add trigger</Btn>
          <Btn type="Secondary" size="Small" iconLeft={<Ico.Plus s={14} c={DS.actionPrimary}/>} onClick={()=>{}}>Add condition</Btn>
          <Btn type="Secondary" size="Small" iconLeft={<Ico.Plus s={14} c={DS.actionPrimary}/>} onClick={()=>{}}>Add action</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── Connect Tab ──────────────────────────────────────────────────────────────
function ConnectTab({ form }) {
  const [crmOn, setCRM] = useState(true);
  const [cdpOn, setCDP] = useState(false);
  const [ssoOn, setSSO] = useState(false);
  const [copied, setCopied] = useState(null);
  const pub = form?.status === "active";
  const url = `https://forms.arenametrix.com/${form?.id||"preview"}`;
  const iframe = `<iframe src="${url}" width="100%" height="600" frameborder="0"></iframe>`;
  const js = `<script src="https://cdn.arenametrix.com/form.js" data-form-id="${form?.id||"preview"}"></script>`;
  function copy(text, key) { navigator.clipboard.writeText(text).catch(()=>{}); setCopied(key); setTimeout(()=>setCopied(null),2000); }

  return (
    <div style={{ background:DS.bgPage, padding:24, height:"calc(100vh - 185px)", overflow:"auto", display:"flex", gap:16 }}>
      <div style={{ flex:1, display:"flex", flexDirection:"column", gap:16 }}>
        <div style={{ background:DS.bgCard, border:`1px solid ${DS.borderDefault}`, borderRadius:10, overflow:"hidden" }}>
          <div style={{ padding:"12px 16px", borderBottom:`1px solid ${DS.borderDefault}` }}>
            <span style={{ ...TY.h5, color:DS.textDefault, fontFamily:DS.ff }}>Integrations</span>
          </div>
          {[{label:"AX CRM",sub:"Sync responses to contact records",icon:Ico.CRM,val:crmOn,set:setCRM,c:DS.teal500},
            {label:"AX CDP",sub:"Push data to your customer data platform",icon:Ico.Connect,val:cdpOn,set:setCDP,c:DS.purple},
            {label:"AX SSO",sub:"Enable single sign-on pre-fill",icon:Ico.Check,val:ssoOn,set:setSSO,c:DS.feedbackSuccess}].map(({label,sub,icon:IC,val,set,c})=>(
            <div key={label} style={{ padding:"14px 16px", borderBottom:`1px solid ${DS.borderDefault}`, display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:36, height:36, borderRadius:8, background:DS.bgSurface, border:`1px solid ${DS.borderDefault}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <IC s={18} c={c}/>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ ...TY.h5, color:DS.textDefault, fontFamily:DS.ff }}>{label}</div>
                <div style={{ ...TY.b3, color:DS.textSecondary, fontFamily:DS.ff }}>{sub}</div>
              </div>
              <Toggle on={val} onChange={set}/>
            </div>
          ))}
        </div>
        <div style={{ background:DS.bgCard, border:`1px solid ${DS.borderDefault}`, borderRadius:10, overflow:"hidden" }}>
          <div style={{ padding:"12px 16px", borderBottom:`1px solid ${DS.borderDefault}` }}>
            <span style={{ ...TY.h5, color:DS.textDefault, fontFamily:DS.ff }}>Contact routing</span>
          </div>
          <div style={{ padding:16, display:"flex", flexDirection:"column", gap:10 }}>
            <div style={{ ...TY.b3, color:DS.textSecondary, fontFamily:DS.ff }}>Add respondents to list</div>
            <select style={{ height:36, border:`1px solid ${DS.borderDefault}`, borderRadius:4, padding:"0 10px", fontFamily:DS.ff, ...TY.b2, color:DS.textDefault, background:DS.bgSurface, outline:"none" }}>
              <option>Newsletter subscribers</option><option>Event attendees</option><option>VIP contacts</option><option>B2B prospects</option>
            </select>
            <div style={{ ...TY.b3, color:DS.textSecondary, fontFamily:DS.ff, marginTop:4 }}>Segment</div>
            <select style={{ height:36, border:`1px solid ${DS.borderDefault}`, borderRadius:4, padding:"0 10px", fontFamily:DS.ff, ...TY.b2, color:DS.textDefault, background:DS.bgSurface, outline:"none" }}>
              <option>— No segment —</option><option>Fans engaged 2026</option><option>Contest participants</option>
            </select>
          </div>
        </div>
      </div>
      <div style={{ flex:1, display:"flex", flexDirection:"column", gap:16 }}>
        {!pub && <div style={{ background:DS.feedbackWarningBg, border:`1px solid ${DS.feedbackWarning}`, borderRadius:8, padding:"10px 16px", display:"flex", gap:10, alignItems:"center" }}>
          <Ico.Warn s={16} c={DS.feedbackWarning}/>
          <span style={{ ...TY.b3, color:DS.feedbackWarning, fontFamily:DS.ff }}>Publish your form to activate distribution channels.</span>
        </div>}
        {[{key:"url",label:"Public URL",icon:Ico.Globe,code:url,help:"Share this link directly with your audience."},
          {key:"iframe",label:"iFrame embed",icon:Ico.Code,code:iframe,help:"Embed in any webpage. Developers can override branding via CSS."},
          {key:"js",label:"JavaScript snippet",icon:Ico.Code,code:js,help:"Supports SPA frameworks."}].map(({key,label,icon:IC,code,help})=>(
          <div key={key} style={{ background:DS.bgCard, border:`1px solid ${DS.borderDefault}`, borderRadius:10, overflow:"hidden" }}>
            <div style={{ padding:"12px 16px", borderBottom:`1px solid ${DS.borderDefault}`, display:"flex", gap:8, alignItems:"center" }}>
              <IC s={14} c={DS.actionPrimary}/><span style={{ ...TY.h5, color:DS.textDefault, fontFamily:DS.ff }}>{label}</span>
            </div>
            <div style={{ padding:14 }}>
              <div style={{ ...TY.b3, color:DS.textSecondary, fontFamily:DS.ff, marginBottom:8 }}>{help}</div>
              <div style={{ position:"relative" }}>
                <div style={{ background:DS.bgSurface, border:`1px solid ${DS.borderDefault}`, borderRadius:4, padding:"8px 40px 8px 10px", fontFamily:"monospace", fontSize:11, color:DS.textDefault, wordBreak:"break-all", lineHeight:"16px" }}>{code}</div>
                <button onClick={()=>copy(code,key)} style={{ position:"absolute", top:6, right:6, width:28, height:28, border:`1px solid ${DS.borderDefault}`, borderRadius:4, background:DS.bgCard, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {copied===key ? <Ico.Check s={14} c={DS.feedbackSuccess}/> : <Ico.Copy s={14} c={DS.actionPrimary}/>}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Results Tab — rich dashboard ────────────────────────────────────────────
function ResultsTab({ form }) {
  const [period, setPeriod] = useState("all");
  const isEmpty = !form || form.contacts === 0;

  if (isEmpty) return (
    <div style={{ background:DS.bgPage, height:"calc(100vh - 185px)", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:12 }}>
      <Ico.Chart s={40} c={DS.neutral500}/>
      <div style={{ ...TY.h5, color:DS.textDefault, fontFamily:DS.ff }}>No responses yet</div>
      <div style={{ ...TY.b2, color:DS.textSecondary, fontFamily:DS.ff }}>Share your form to start collecting data.</div>
      <Btn type="Primary" iconLeft={<Ico.Connect s={16} c={DS.textInverse}/>} onClick={()=>{}}>Go to Connect</Btn>
    </div>
  );

  const rate = cr(form);
  const dropoff = [
    {label:"Page 1 — Fields",  value:form.contacts, pct:100},
    {label:"Page 2 — Details", value:Math.round(form.contacts*0.68), pct:68},
    {label:"Page 3 — Submit",  value:Math.round(form.contacts*rate/100), pct:rate},
  ];
  const fieldData = [
    {label:"First name",       type:"text",   filled:Math.round(form.contacts*0.98), total:form.contacts},
    {label:"Email address",    type:"email",  filled:form.contacts, total:form.contacts},
    {label:"I am interested in…",type:"select",filled:Math.round(form.contacts*0.71), total:form.contacts,
      options:[{v:"VIP Experience",n:Math.round(form.contacts*0.28)},{v:"Newsletter",n:Math.round(form.contacts*0.32)},{v:"Events",n:Math.round(form.contacts*0.40)}]},
    {label:"Long custom field label…",type:"text",filled:Math.round(form.contacts*0.43), total:form.contacts},
  ];
  const weeklyData = [
    {label:"Mon",value:Math.round(form.contacts*0.08)},
    {label:"Tue",value:Math.round(form.contacts*0.14)},
    {label:"Wed",value:Math.round(form.contacts*0.18)},
    {label:"Thu",value:Math.round(form.contacts*0.22)},
    {label:"Fri",value:Math.round(form.contacts*0.20)},
    {label:"Sat",value:Math.round(form.contacts*0.12)},
    {label:"Sun",value:Math.round(form.contacts*0.06)},
  ];
  const maxW = Math.max(...weeklyData.map(d=>d.value));

  return (
    <div style={{ background:DS.bgPage, padding:24, height:"calc(100vh - 185px)", overflow:"auto", display:"flex", flexDirection:"column", gap:16 }}>
      {/* KPI strip — corrected CardStats from Figma */}
      <div style={{ display:"flex", gap:16 }}>
        <CardStats title="Total responses" value={form.contacts.toLocaleString()} subvalue={`out of ${form.sent.toLocaleString()} sent`} icon={Ico.Responses}/>
        <CardStats title="Completion rate" value={rate+"%"} subvalue={rate<20?"Low — review friction":"Good performance"} icon={Ico.Donut} iconColor={rate<20?DS.feedbackError:DS.feedbackSuccess} trend={rate<20?"down":"up"} trendVal={rate<20?"-12pts vs avg":"+5pts vs avg"}/>
        <CardStats title="Avg. pages reached" value={form.pages>1?"2.1":1} subvalue={`out of ${form.pages} pages`} icon={Ico.Form}/>
        <CardStats title="Last response" value="2h ago" subvalue="21 May 2026, 14:32" icon={Ico.Chart}/>
      </div>

      {/* Row 2: Volume chart + Donut */}
      <div style={{ display:"flex", gap:16 }}>
        {/* Volume bar chart */}
        <div style={{ background:DS.bgCard, border:`1px solid ${DS.borderDefault}`, borderRadius:10, padding:16, flex:2 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div style={{ ...TY.h5, color:DS.textDefault, fontFamily:DS.ff }}>Response volume</div>
            <div style={{ display:"flex", gap:4 }}>
              {["week","month","all"].map(p=>(
                <button key={p} onClick={()=>setPeriod(p)} style={{ padding:"4px 10px", borderRadius:4, border:"none", cursor:"pointer", background: period===p ? DS.actionPrimary : "transparent", color: period===p ? DS.textInverse : DS.textSecondary, fontFamily:DS.ff, ...TY.b3, transition:"all .15s" }}>
                  {p.charAt(0).toUpperCase()+p.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"flex-end", gap:8, height:100 }}>
            {weeklyData.map((d,i)=>(
              <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                <div style={{ width:"100%", background:DS.actionPrimary, borderRadius:"4px 4px 0 0", height: maxW>0 ? Math.round(d.value/maxW*80)+"px" : "0px", transition:"height .4s", opacity: 0.6+i*0.06 }}/>
                <span style={{ ...TY.b3, color:DS.textSecondary, fontFamily:DS.ff }}>{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Completion donut */}
        <div style={{ background:DS.bgCard, border:`1px solid ${DS.borderDefault}`, borderRadius:10, padding:16, flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12 }}>
          <div style={{ ...TY.h5, color:DS.textDefault, fontFamily:DS.ff, alignSelf:"flex-start" }}>Completion</div>
          <DonutChart pct={rate} color={rate<20?DS.feedbackError:rate<50?DS.feedbackWarning:DS.actionPrimary} size={100} stroke={12}/>
          <div style={{ display:"flex", flexDirection:"column", gap:4, width:"100%" }}>
            {[{label:"Completed",pct:rate,c:DS.actionPrimary},{label:"Partial",pct:Math.round((100-rate)*0.4),c:DS.feedbackWarning},{label:"Bounced",pct:Math.round((100-rate)*0.6),c:DS.feedbackErrorBg}].map(x=>(
              <div key={x.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                  <span style={{ width:8, height:8, borderRadius:"50%", background:x.c, flexShrink:0 }}/>
                  <span style={{ ...TY.b3, color:DS.textSecondary, fontFamily:DS.ff }}>{x.label}</span>
                </div>
                <span style={{ ...TY.b3, color:DS.textDefault, fontFamily:DS.ff, fontWeight:600 }}>{x.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Drop-off + Field breakdown */}
      <div style={{ display:"flex", gap:16 }}>
        {/* Drop-off */}
        <div style={{ background:DS.bgCard, border:`1px solid ${DS.borderDefault}`, borderRadius:10, padding:16, flex:1 }}>
          <div style={{ ...TY.h5, color:DS.textDefault, fontFamily:DS.ff, marginBottom:16 }}>Drop-off by page</div>
          <HBarChart data={dropoff.map(d=>({label:`${d.label} (${d.pct}%)`,value:d.value}))}
            colorFn={(d,i)=>i===0?DS.feedbackSuccess:i===1?DS.actionPrimary:rate<20?DS.feedbackError:DS.feedbackWarning}/>
        </div>

        {/* Field breakdown */}
        <div style={{ background:DS.bgCard, border:`1px solid ${DS.borderDefault}`, borderRadius:10, padding:16, flex:2 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div style={{ ...TY.h5, color:DS.textDefault, fontFamily:DS.ff }}>Field responses</div>
            <div style={{ display:"flex", gap:8 }}>
              <Btn type="Secondary" size="Small" iconLeft={<Ico.Export s={14} c={DS.actionPrimary}/>} onClick={()=>{}}>Export CSV</Btn>
              <Btn type="Primary" size="Small" iconLeft={<Ico.CRM s={14} c={DS.textInverse}/>} onClick={()=>{}}>Push to CRM</Btn>
            </div>
          </div>
          {fieldData.map(f=>(
            <div key={f.label} style={{ marginBottom:14, paddingBottom:14, borderBottom:`1px solid ${DS.borderDefault}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ ...TY.b3, color:DS.textDefault, fontFamily:DS.ff, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:240 }}>{f.label}</span>
                <div style={{ display:"flex", gap:8 }}>
                  <span style={{ ...TY.b3, color:DS.textSecondary, fontFamily:DS.ff }}>{f.filled.toLocaleString()} filled</span>
                  <span style={{ ...TY.b3, color:DS.textSecondary, fontFamily:DS.ff }}>({Math.round(f.filled/f.total*100)}%)</span>
                </div>
              </div>
              {f.options ? (
                <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                  {f.options.map(o=>(
                    <div key={o.v} style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ ...TY.b3, color:DS.textSecondary, fontFamily:DS.ff, minWidth:120, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{o.v}</span>
                      <div style={{ flex:1, height:6, background:DS.bgSurface, borderRadius:3, overflow:"hidden" }}>
                        <div style={{ height:"100%", width:Math.round(o.n/f.filled*100)+"%", background:DS.teal500, borderRadius:3 }}/>
                      </div>
                      <span style={{ ...TY.b3, color:DS.textSecondary, fontFamily:DS.ff, minWidth:28, textAlign:"right" }}>{o.n}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ height:6, background:DS.bgSurface, borderRadius:3, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:Math.round(f.filled/f.total*100)+"%", background:DS.actionPrimary, borderRadius:3 }}/>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Low CR alert */}
      {rate < 20 && (
        <div style={{ background:DS.feedbackErrorBg, border:`1px solid ${DS.feedbackError}`, borderRadius:8, padding:"12px 16px", display:"flex", gap:10, alignItems:"center" }}>
          <Ico.Warn s={16} c={DS.feedbackError}/>
          <span style={{ ...TY.b3, color:DS.feedbackErrorText, fontFamily:DS.ff }}>
            Low completion rate ({rate}%). Consider reducing field count or reviewing branching logic to reduce friction.
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function ArenaForm() {
  const [screen, setScreen] = useState("overview");
  const [form, setForm] = useState(null);
  const [isNew, setIsNew] = useState(false);

  function open(f) { setForm(f); setIsNew(false); setScreen("editor"); }
  function create() { setForm(null); setIsNew(true); setScreen("editor"); }
  function back() { setScreen("overview"); setForm(null); }

  return (
    <div style={{ fontFamily: DS.ff }}>
      {screen === "overview"
        ? <FormsOverview onOpen={open} onCreate={create}/>
        : <FormEditor form={form} isNew={isNew} onBack={back}/>}
    </div>
  );
}