import { useState, useEffect, useMemo, useRef } from "react";
import {
    AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer,
} from "recharts";
import Ico from "../../utils/icons";

/* ═══════════════════════════════════════════════════════════════════════════
   LOCAL ICON EXTENSIONS
   ═══════════════════════════════════════════════════════════════════════════ */
const IcoX = {
    TrendUp: ({ s = 14, c = '#16A34A' }) => (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
            <path d="M3 14l5-5 3 3 6-7" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14 5h3v3" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    TrendDown: ({ s = 14, c = '#DC2626' }) => (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
            <path d="M3 6l5 5 3-3 6 7" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14 15h3v-3" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    ChartBar: ({ s = 16, c = '#017BFE' }) => (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
            <rect x="3" y="10" width="4" height="7" rx="1" stroke={c} strokeWidth="1.5" />
            <rect x="8" y="6" width="4" height="11" rx="1" stroke={c} strokeWidth="1.5" />
            <rect x="13" y="3" width="4" height="14" rx="1" stroke={c} strokeWidth="1.5" />
        </svg>
    ),
    Funnel: ({ s = 16, c = '#017BFE' }) => (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
            <path d="M3 4h14l-5.5 7v5l-3-1.5V11L3 4z" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    ChevDown: ({ s = 14, c = '#017BFE' }) => (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
            <path d="M5 8l5 5 5-5" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
};

/* ═══════════════════════════════════════════════════════════════════════════
   DS TOKENS
   ═══════════════════════════════════════════════════════════════════════════ */
const DS = {
    actionPrimary: '#017BFE', actionPrimaryHover: '#96C2FE',
    actionSecondaryBorder: '#017BFE', actionSecondaryHover: '#EFF4FF',
    actionSecondaryTextHover: '#017BFE', actionTertiaryHover: '#EFF4FF',
    actionTertiaryTextHover: '#017BFE', actionDisabledBg: '#E2DDDD',
    actionDisabledText: '#9A9EA5',
    feedbackSuccess: '#16A34A', feedbackSuccessBg: '#DEF9F4',
    feedbackWarning: '#D97706', feedbackWarningBg: '#FEF3C7',
    feedbackError: '#DC2626', feedbackErrorBg: '#FFEBE8', feedbackErrorText: '#991B1B',
    feedbackInfo: '#017BFE', feedbackInfoBg: '#EFF4FF',
    borderDefault: '#E2DDDD', borderFocus: '#017BFE', borderError: '#DC2626',
    textDefault: '#1F2937', textSecondary: '#9A9EA5', textPlaceholder: '#9A9EA5',
    textDisabled: '#9A9EA5', textInverse: '#FFFFFF',
    bgPage: '#F0F2F5', bgCard: '#FFFFFF', bgSurface: '#F9FBFB',
    navActiveTab: '#4E6FC7', navGradientFrom: '#2CB1A2', navGradientTo: '#5585B8',
    navText: '#242731',
    blue600: '#0D69D4', blue500: '#017BFE', blue300: '#96C2FE',
    blue200: '#C6E2FF', blue100: '#EFF4FF',
    neutral900: '#1F2937', neutralBlack: '#212121', neutral500: '#9A9EA5',
    neutralGrey: '#717171', neutral200: '#E2DDDD', neutral100: '#F9FBFB',
    neutral0: '#FFFFFF',
    red600: '#DC2626', red100: '#FFEBE8',
    green600: '#16A34A', green100: '#DCFCE7',
    teal500: '#34B0A1', teal200: '#B4EBE2', teal100: '#DEF9F4',
    amber600: '#D97706', amber100: '#FEF3C7',
    orange500: '#FE9D55', orange100: '#FFF3E8',
    purple: '#7C3AED', purpleLight: '#EDE9FE',
    ff: "'Inter', sans-serif",
};

const TY = {
    h3: { fontSize: 20, fontWeight: 600, lineHeight: '28px' },
    h4: { fontSize: 16, fontWeight: 600, lineHeight: '22px' },
    h5: { fontSize: 14, fontWeight: 600, lineHeight: '18px' },
    b1: { fontSize: 16, fontWeight: 400, lineHeight: '22px' },
    b2: { fontSize: 14, fontWeight: 400, lineHeight: '18px' },
    b3: { fontSize: 12, fontWeight: 400, lineHeight: '16px' },
};

/* ═══════════════════════════════════════════════════════════════════════════
   ATOMS — Button, IconBtn
   ═══════════════════════════════════════════════════════════════════════════ */
function Btn({ label, onClick, type = "Primary", size = "Medium", iconLeft = null, style: xtra = {} }) {
    const [hov, setHov] = useState(false);
    const h = size === "Small" ? 32 : 40;
    const ty = size === "Small" ? TY.b3 : TY.b2;
    const base = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: h, padding: '0 16px', borderRadius: 6, fontFamily: DS.ff, ...ty, fontWeight: 400, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all .15s', ...xtra };
    const sp = {
        Primary: { bg: [DS.actionPrimary, DS.actionPrimaryHover], bd: [DS.actionPrimary, DS.actionPrimaryHover], cl: [DS.textInverse, DS.textInverse] },
        Secondary: { bg: [DS.bgCard, DS.actionSecondaryHover], bd: [DS.actionSecondaryBorder, DS.actionSecondaryBorder], cl: [DS.textDefault, DS.actionSecondaryTextHover] },
        Tertiary: { bg: ['transparent', DS.actionTertiaryHover], bd: ['transparent', 'transparent'], cl: [DS.textDefault, DS.actionTertiaryTextHover] },
    }[type] || {};
    const i = hov ? 1 : 0;
    return (
        <button onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={onClick}
            style={{ ...base, background: sp.bg[i], border: type === 'Tertiary' ? 'none' : `1px solid ${sp.bd[i]}`, color: sp.cl[i] }}>
            {iconLeft}{label}
        </button>
    );
}

function IconBtn({ icon, onClick, type = "Secondary", size = "Medium", active = false, style: xtra = {} }) {
    const [hov, setHov] = useState(false);
    const sz = size === "Small" ? 28 : 40;
    const isPri = type === "Primary" || active;
    return (
        <button onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={onClick}
            style={{
                width: sz, height: sz, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all .15s', flexShrink: 0,
                background: isPri ? (hov ? DS.actionPrimaryHover : DS.actionPrimary) : (hov ? DS.actionSecondaryHover : DS.bgCard),
                border: `1px solid ${isPri ? (hov ? DS.actionPrimaryHover : DS.actionPrimary) : DS.actionSecondaryBorder}`,
                ...xtra
            }}>{icon}</button>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   DROPDOWN
   ═══════════════════════════════════════════════════════════════════════════ */
function OptionsMenu({ items = [] }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        const fn = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', fn);
        return () => document.removeEventListener('mousedown', fn);
    }, []);
    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <Btn type="Secondary" size="Medium" label="Options" iconLeft={<Ico.Dots s={16} c={DS.textDefault} />} onClick={() => setOpen(o => !o)} />
            {open && (
                <div style={{ position: 'absolute', top: 44, right: 0, zIndex: 50, width: 212, borderRadius: 4, border: `1px solid ${DS.borderDefault}`, background: DS.bgCard, boxShadow: '0 2px 8px rgba(0,0,0,.1)' }}>
                    {items.map((item, i) => (
                        <OptionItem key={i} label={item.label} icon={item.icon} onClick={() => { item.onClick?.(); setOpen(false); }} danger={item.danger} />
                    ))}
                </div>
            )}
        </div>
    );
}

function OptionItem({ label, icon, onClick, danger }) {
    const [hov, setHov] = useState(false);
    return (
        <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={onClick}
            style={{ display: 'flex', alignItems: 'center', gap: 10, height: 40, padding: '0 10px', cursor: 'pointer', background: hov ? DS.actionSecondaryHover : 'transparent', fontFamily: DS.ff, ...TY.b2, color: danger ? DS.feedbackError : DS.textDefault, transition: 'background .12s' }}>
            {icon}{label}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TAG ATOMS
   ═══════════════════════════════════════════════════════════════════════════ */
const typeC = {
    Email: { bg: DS.blue100, border: DS.blue600, text: DS.blue600 },
    Transactional: { bg: DS.amber100, border: DS.amber600, text: DS.amber600 },
    Manual: { bg: DS.purpleLight, border: DS.purple, text: DS.purple },
    SMS: { bg: DS.teal100, border: DS.teal500, text: DS.teal500 },
};

function TypeTag({ type }) {
    const c = typeC[type] || typeC.Email;
    return <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 44, padding: '4px 8px', borderRadius: 10, background: c.bg, border: `1px solid ${c.border}`, fontFamily: DS.ff, ...TY.b3, color: c.text, whiteSpace: 'nowrap' }}>{type}</span>;
}

function Tag({ text, color }) {
    const c = color || DS.blue600;
    return <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 44, padding: '4px 8px', borderRadius: 10, background: DS.blue100, border: `1px solid ${c}`, fontFamily: DS.ff, ...TY.b3, color: c, whiteSpace: 'nowrap' }}>{text}</span>;
}

/* ═══════════════════════════════════════════════════════════════════════════
   MOCK DATA
   ═══════════════════════════════════════════════════════════════════════════ */
const campaigns = [
    { id: 1, name: "Campagne Rentrée Septembre — Email Fidélité Premium", startDate: "29/08/2024", endDate: "29/08/2024", type: "Email", cost: 30, objective: "Conversion", revenue: 850, delivered: 2840, openRate: 41.2, clickRate: 8.7, bounceRate: 1.1, unsubscribes: 3 },
    { id: 2, name: "Campagne Transac Août", startDate: "20/08/2024", endDate: "25/08/2024", type: "Transactional", cost: 20, objective: "Conversion", revenue: 20, delivered: 540, openRate: 72.1, clickRate: 14.3, bounceRate: 0.4, unsubscribes: 1 },
    { id: 3, name: "Campagne Transac Mi-Août", startDate: "17/08/2024", endDate: "20/08/2024", type: "Transactional", cost: 0, objective: "Conversion", revenue: 21, delivered: 310, openRate: 68.5, clickRate: 11.2, bounceRate: 0.6, unsubscribes: 0 },
    { id: 4, name: "Campagne Manuelle Août", startDate: "09/08/2024", endDate: "09/08/2024", type: "Manual", cost: 100, objective: "Non", revenue: null, delivered: 1200, openRate: null, clickRate: null, bounceRate: null, unsubscribes: null },
    { id: 5, name: "Campagne Email Été", startDate: "03/08/2024", endDate: "03/08/2024", type: "Email", cost: 0, objective: "Conversion", revenue: 37, delivered: 980, openRate: 35.4, clickRate: 6.1, bounceRate: 2.3, unsubscribes: 7 },
    { id: 6, name: "Campagne SMS Été", startDate: "28/07/2024", endDate: "28/07/2024", type: "SMS", cost: 13, objective: "Non", revenue: null, delivered: 450, openRate: null, clickRate: 18.2, bounceRate: 0.9, unsubscribes: 2 },
    { id: 7, name: "Campagne Email Juillet Mid", startDate: "22/07/2024", endDate: "22/07/2024", type: "Email", cost: 0, objective: "Conversion", revenue: 130, delivered: 1560, openRate: 38.7, clickRate: 9.4, bounceRate: 1.8, unsubscribes: 4 },
    { id: 8, name: "Campagne Email Juillet", startDate: "18/07/2024", endDate: "18/07/2024", type: "Email", cost: 25, objective: "Conversion", revenue: 176, delivered: 2100, openRate: 44.1, clickRate: 12.0, bounceRate: 1.2, unsubscribes: 6 },
    { id: 9, name: "Campagne Email Juillet Debut", startDate: "10/07/2024", endDate: "10/07/2024", type: "Email", cost: 75, objective: "Conversion", revenue: 54, delivered: 760, openRate: 29.8, clickRate: 5.3, bounceRate: 3.8, unsubscribes: 12 },
];

const kpis = [
    { label: "Campaigns",            value: "11",      delta:  6.3, icon: "Campaigns", iconColor: DS.actionPrimary, iconBg: DS.blue100 },
    { label: "Conversions generated",value: "1 048€",  delta:  4.8, icon: "Cart",      iconColor: DS.actionPrimary, iconBg: DS.blue100 },
    { label: "Contacts reached",     value: "122",     delta: -8.3, icon: "Users",     iconColor: DS.actionPrimary, iconBg: DS.blue100 },
    { label: "Purchases",            value: "58",      delta:  6.3, icon: "Ticket",    iconColor: DS.actionPrimary, iconBg: DS.blue100 },
];

const chartData = (() => {
    const s = new Date("2024-07-04");
    return Array.from({ length: 57 }, (_, i) => {
        const d = new Date(s); d.setDate(d.getDate() + i);
        const t = i / 56;
        const g = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        return { date: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`, ventes: Math.round(g * 2200 + Math.random() * 30), emailsDest: Math.round(g * 1050 + Math.random() * 20), emailsOuv: Math.round(g * 450 + Math.random() * 15), emailsCliq: Math.round(g * 300 + Math.random() * 10), smsCliq: Math.round(g * 80 + Math.random() * 5) };
    }).filter((_, i) => i % 3 === 0);
})();

/* ═══════════════════════════════════════════════════════════════════════════
   KPI CARDS
   ═══════════════════════════════════════════════════════════════════════════ */
function DeltaBadge({ delta }) {
    const pos = delta >= 0;
    const Icon = pos ? IcoX.TrendUp : IcoX.TrendDown;
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 999, background: pos ? DS.feedbackSuccessBg : DS.feedbackErrorBg, fontFamily: DS.ff, ...TY.b3, fontWeight: 600, color: pos ? DS.feedbackSuccess : DS.feedbackError }}>
            <Icon s={12} c={pos ? DS.feedbackSuccess : DS.feedbackError} />
            {pos ? "+" : ""}{delta}%
        </span>
    );
}

function KpiBar() {
    return (
        <div style={{ display: 'flex', gap: 16, margin: '0 24px' }}>
            {kpis.map((k, i) => {
                const IcoComp = Ico[k.icon];
                return (
                    <div key={i} style={{ flex: 1, minWidth: 150, borderRadius: 10, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10, background: DS.bgCard, border: `1px solid ${DS.borderDefault}` }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                            <div style={{ fontFamily: DS.ff, ...TY.b2, color: DS.textSecondary, textAlign: 'left', lineHeight: '1.3' }}>{k.label}</div>
                            <div style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0, background: k.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {IcoComp && <IcoComp s={18} c={k.iconColor} />}
                            </div>
                        </div>
                        <div style={{ fontFamily: DS.ff, fontSize: 26, fontWeight: 600, lineHeight: '1', color: DS.textDefault }}>{k.value}</div>
                        <div><DeltaBadge delta={k.delta} /></div>
                    </div>
                );
            })}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CHART VIEW
   ═══════════════════════════════════════════════════════════════════════════ */
const series = [
    { key: "emailsDest", name: "Email — recipients", color: "#3b82f6", icon: "Mail", stack: "email" },
    { key: "emailsOuv",  name: "Email — openers",    color: "#6366f1", icon: "Mail", stack: "email" },
    { key: "emailsCliq", name: "Email — clicks",     color: "#93c5fd", icon: "Mail", stack: "email" },
    { key: "smsCliq",    name: "SMS — clicks",       color: "#fca5a5", icon: "Campaigns", stack: "email" },
    { key: "ventes",     name: "Sales",              color: "#4ade80", icon: "Cart", stack: null },
];

function CTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return <div style={{ background: DS.bgCard, border: `1px solid ${DS.borderDefault}`, borderRadius: 4, padding: '10px 14px', boxShadow: '0 2px 4px rgba(0,0,0,.08)' }}>
        <div style={{ fontFamily: DS.ff, ...TY.h5, color: DS.textDefault, marginBottom: 6 }}>{label}</div>
        {payload.map((p, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: p.fill || p.stroke }} />
            <span style={{ fontFamily: DS.ff, ...TY.b3, color: DS.textDefault }}>{p.name}: <strong>{p.value?.toLocaleString()}</strong></span>
        </div>)}
    </div>;
}

const parseDMY = s => { const [d, m, y] = s.split("/").map(Number); return new Date(y, m - 1, d); };
const CSTART = new Date("2024-07-04"), CEND = new Date("2024-08-29"), CSPAN = CEND - CSTART;
const pct = ds => Math.max(0, Math.min(1, (parseDMY(ds) - CSTART) / CSPAN));

function assignLanes(items) {
    const sorted = [...items].sort((a, b) => pct(a.startDate) - pct(b.startDate));
    const lanes = [];
    sorted.forEach(c => {
        const p = pct(c.startDate); let placed = false;
        for (let l = 0; l < lanes.length; l++) { if (p - lanes[l][lanes[l].length - 1].p > .04) { lanes[l].push({ c, p }); placed = true; break; } }
        if (!placed) lanes.push([{ c, p }]);
    });
    const r = []; lanes.forEach((ln, li) => ln.forEach(({ c, p }) => r.push({ c, p, lane: li }))); return r;
}

function TimelineBadge({ campaign: c, p: pctVal, lane }) {
    const [hov, setHov] = useState(false);
    const tc = typeC[c.type] || typeC.Email;
    const sz = 26, lh = sz + 4;
    return <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{ position: 'absolute', left: `${pctVal * 100}%`, top: lane * lh, transform: 'translateX(-50%)', zIndex: hov ? 10 : 1 }}>
        <div style={{ width: sz, height: sz, borderRadius: 6, background: tc.bg, border: `1.5px solid ${tc.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform .15s, box-shadow .15s', transform: hov ? 'scale(1.15)' : 'scale(1)', boxShadow: hov ? '0 2px 8px rgba(0,0,0,.15)' : 'none' }}>
            <Ico.Campaigns s={14} c={tc.text} />
        </div>
        {hov && <div style={{ position: 'absolute', bottom: sz + 6, left: '50%', transform: 'translateX(-50%)', background: DS.bgCard, border: `1px solid ${DS.borderDefault}`, borderRadius: 4, padding: '8px 10px', boxShadow: '0 2px 8px rgba(0,0,0,.12)', whiteSpace: 'nowrap', zIndex: 20, pointerEvents: 'none' }}>
            <div style={{ fontFamily: DS.ff, ...TY.h5, color: DS.textDefault, marginBottom: 2 }}>{c.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <TypeTag type={c.type} />
                <span style={{ fontFamily: DS.ff, ...TY.b3, color: DS.textSecondary }}>{c.startDate}{c.startDate !== c.endDate ? ` → ${c.endDate}` : ''}</span>
            </div>
            {c.revenue != null && <div style={{ fontFamily: DS.ff, ...TY.b3, color: DS.actionPrimary, marginTop: 2 }}>Revenue: {c.revenue}€</div>}
        </div>}
    </div>;
}

const CHART_MARGIN = { top: 10, right: 10, left: 50, bottom: 0 };
const CHART_HEIGHT = 280;

function ChartView() {
    const [ct, setCt] = useState("area");
    const [hid, setHid] = useState({});
    const laneItems = useMemo(() => assignLanes(campaigns), []);
    const maxLane = useMemo(() => Math.max(...laneItems.map(i => i.lane), 0), [laneItems]);
    const tlH = (maxLane + 1) * 30 + 12;
    return <div style={{ background: DS.bgCard, border: `1px solid ${DS.borderDefault}`, borderRadius: 10, margin: '16px 24px', padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
                <div style={{ fontFamily: DS.ff, ...TY.h5, color: DS.textDefault, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 10 }}>Conversions generated vs. total sales</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {series.map(s => (
                        <button key={s.key} onClick={() => setHid(h => ({ ...h, [s.key]: !h[s.key] }))}
                            style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: 0, opacity: hid[s.key] ? .35 : 1, transition: 'opacity .15s' }}>
                            <div style={{ width: 10, height: 10, borderRadius: 2, background: s.color, flexShrink: 0 }} />
                            <span style={{ fontFamily: DS.ff, ...TY.b3, color: DS.textSecondary }}>{s.name}</span>
                        </button>
                    ))}
                </div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
                <IconBtn icon={<IcoX.ChartBar s={18} c={ct === "area" ? DS.textInverse : DS.actionPrimary} />} active={ct === "area"} onClick={() => setCt("area")} />
                <IconBtn icon={<Ico.List s={18} c={ct === "bar" ? DS.textInverse : DS.actionPrimary} />} active={ct === "bar"} onClick={() => setCt("bar")} />
            </div>
        </div>
        <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: CHART_MARGIN.left, right: CHART_MARGIN.right, pointerEvents: 'none', zIndex: 0 }}>
                {laneItems.map(({ c, p }) => <div key={`ln-${c.id}`} style={{ position: 'absolute', left: `${p * 100}%`, top: 0, height: CHART_HEIGHT + 40, width: 0, borderLeft: `1px dashed ${(typeC[c.type] || typeC.Email).border}`, opacity: .25, pointerEvents: 'none' }} />)}
            </div>
            <div style={{ position: 'relative', zIndex: 1 }}>
                <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                    {ct === "area" ? (
                        <AreaChart data={chartData} margin={CHART_MARGIN}>
                            <CartesianGrid strokeDasharray="3 3" stroke={DS.borderDefault} vertical={false} />
                            <XAxis dataKey="date" tick={{ fontFamily: DS.ff, fontSize: 12, fill: DS.textSecondary }} tickLine={false} axisLine={false} interval={3} />
                            <YAxis tick={{ fontFamily: DS.ff, fontSize: 12, fill: DS.textSecondary }} tickLine={false} axisLine={false} />
                            <Tooltip content={<CTooltip />} />
                            {series.map(s => <Area key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} fill={s.color} fillOpacity={s.stack ? .45 : .25} strokeWidth={s.stack ? 1.5 : 2.5} hide={!!hid[s.key]} stackId={s.stack ?? undefined} dot={false} />)}
                        </AreaChart>
                    ) : (
                        <BarChart data={chartData} margin={CHART_MARGIN}>
                            <CartesianGrid strokeDasharray="3 3" stroke={DS.borderDefault} vertical={false} />
                            <XAxis dataKey="date" tick={{ fontFamily: DS.ff, fontSize: 12, fill: DS.textSecondary }} tickLine={false} axisLine={false} interval={3} />
                            <YAxis tick={{ fontFamily: DS.ff, fontSize: 12, fill: DS.textSecondary }} tickLine={false} axisLine={false} />
                            <Tooltip content={<CTooltip />} />
                            {series.map(s => <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color} hide={!!hid[s.key]} stackId={s.stack ?? undefined} radius={[2, 2, 0, 0]} />)}
                        </BarChart>
                    )}
                </ResponsiveContainer>
            </div>
            <div style={{ borderTop: `1px solid ${DS.borderDefault}`, marginTop: 4, paddingTop: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <Ico.Campaigns s={16} c={DS.textSecondary} />
                    <span style={{ fontFamily: DS.ff, ...TY.b3, color: DS.textSecondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5 }}>Campaign sends</span>
                </div>
                <div style={{ position: 'relative', marginLeft: CHART_MARGIN.left, marginRight: CHART_MARGIN.right, height: tlH }}>
                    <div style={{ position: 'absolute', top: 12, left: 0, right: 0, height: 2, background: DS.borderDefault, borderRadius: 1 }} />
                    {laneItems.map(({ c, p, lane }) => <TimelineBadge key={c.id} campaign={c} p={p} lane={lane} />)}
                </div>
            </div>
        </div>
    </div>;
}

/* ═══════════════════════════════════════════════════════════════════════════
   FUNNEL VIEW — new component
   ═══════════════════════════════════════════════════════════════════════════ */
const FUNNEL_STEP_COLORS = ['#017BFE', '#3b82f6', '#6366f1', '#93c5fd', '#16A34A'];

function buildCampaignSteps(c) {
    const sent = c.delivered ? Math.round(c.delivered / 0.97) : null;
    const delivered = c.delivered;
    const isSms = c.type === 'SMS';
    const opens = !isSms && c.openRate && delivered ? Math.round(delivered * c.openRate / 100) : null;
    const clicks = c.clickRate && delivered ? Math.round(delivered * c.clickRate / 100) : null;
    return [
        { label: 'Sent',      value: sent,      color: FUNNEL_STEP_COLORS[0] },
        { label: 'Delivered', value: delivered, color: FUNNEL_STEP_COLORS[1] },
        ...(!isSms ? [{ label: 'Opened',    value: opens,    color: FUNNEL_STEP_COLORS[2] }] : []),
        { label: 'Clicked',   value: clicks,   color: FUNNEL_STEP_COLORS[3] },
        ...(c.objective === 'Conversion' && c.revenue
            ? [{ label: 'Revenue', value: c.revenue, color: FUNNEL_STEP_COLORS[4], isEuro: true }]
            : []),
    ];
}

function FunnelBar({ step, maxVal, isFirst }) {
    const isEuro = step.isEuro;
    const numVal = typeof step.value === 'number' ? step.value : null;
    const barPct = numVal && !isEuro ? Math.max(4, (numVal / maxVal) * 100) : (isEuro ? 10 : 0);
    const displayVal = step.value === null ? 'N/A' : (isEuro ? `${step.value}€` : step.value.toLocaleString());
    const pctOfFirst = !isFirst && numVal && !isEuro && maxVal
        ? Math.round((numVal / maxVal) * 100) : null;

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            {/* Label */}
            <div style={{ width: 72, textAlign: 'right', flexShrink: 0, fontFamily: DS.ff, ...TY.b3, color: DS.textSecondary }}>
                {step.label}
            </div>
            {/* Track */}
            <div style={{ flex: 1, background: DS.bgPage, borderRadius: 4, height: 34, position: 'relative', overflow: 'visible' }}>
                <div style={{
                    width: step.value !== null ? `${barPct}%` : '0%',
                    height: '100%',
                    borderRadius: 4,
                    background: step.color,
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: 10,
                    transition: 'width .45s cubic-bezier(.4,0,.2,1)',
                    minWidth: step.value !== null ? 2 : 0,
                    position: 'relative',
                }}>
                    {step.value !== null && (
                        <span style={{ fontFamily: DS.ff, ...TY.b3, fontWeight: 600, color: DS.textInverse, whiteSpace: 'nowrap' }}>
                            {displayVal}
                        </span>
                    )}
                </div>
                {step.value === null && (
                    <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontFamily: DS.ff, ...TY.b3, color: DS.textSecondary, fontStyle: 'italic' }}>
                        N/A for this type
                    </span>
                )}
                {/* % of total label outside bar */}
                {pctOfFirst !== null && (
                    <span style={{ position: 'absolute', left: `${barPct}%`, top: '50%', transform: 'translateY(-50%)', marginLeft: 8, fontFamily: DS.ff, ...TY.b3, color: DS.textSecondary, whiteSpace: 'nowrap', paddingLeft: 6 }}>
                        {pctOfFirst}%
                    </span>
                )}
            </div>
        </div>
    );
}

function DropOffRow({ fromVal, toVal }) {
    if (!fromVal || !toVal || typeof fromVal !== 'number' || typeof toVal !== 'number') return null;
    const drop = Math.round((1 - toVal / fromVal) * 100);
    if (drop <= 0) return null;
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 72, flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 5, paddingLeft: 4 }}>
                <svg width={10} height={10} viewBox="0 0 10 10" fill="none">
                    <path d="M5 1v8M2 6l3 3 3-3" stroke={DS.feedbackError} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontFamily: DS.ff, ...TY.b3, color: DS.feedbackError, fontWeight: 500 }}>
                    −{drop}% drop-off
                </span>
            </div>
        </div>
    );
}

function FunnelChart({ steps, title, subtitle }) {
    const maxVal = Math.max(...steps.map(s => (typeof s.value === 'number' && !s.isEuro) ? s.value : 0));
    return (
        <div style={{ background: DS.bgCard, border: `1px solid ${DS.borderDefault}`, borderRadius: 10, padding: '18px 20px' }}>
            <div style={{ fontFamily: DS.ff, ...TY.h5, color: DS.textDefault, marginBottom: 2, textAlign: 'left' }}>{title}</div>
            <div style={{ fontFamily: DS.ff, ...TY.b3, color: DS.textSecondary, marginBottom: 16, textAlign: 'left' }}>{subtitle}</div>
            {steps.map((step, i) => (
                <div key={step.label}>
                    <FunnelBar step={step} maxVal={maxVal} isFirst={i === 0} />
                    {i < steps.length - 1 && !step.isEuro && !steps[i + 1].isEuro && (
                        <DropOffRow fromVal={step.value} toVal={steps[i + 1].value} />
                    )}
                </div>
            ))}
        </div>
    );
}

// Small date select for campaign tab
function CampaignSelector({ selectedId, onChange }) {
    const [hov, setHov] = useState(null);
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10, marginBottom: 16 }}>
            {campaigns.map(c => {
                const sel = selectedId === c.id;
                const tc = typeC[c.type] || typeC.Email;
                return (
                    <div key={c.id}
                        onMouseEnter={() => setHov(c.id)}
                        onMouseLeave={() => setHov(null)}
                        onClick={() => onChange(c.id)}
                        style={{
                            background: sel ? DS.blue100 : DS.bgCard,
                            border: `1px solid ${sel ? DS.actionPrimary : (hov === c.id ? DS.actionPrimary : DS.borderDefault)}`,
                            borderRadius: 8,
                            padding: '10px 14px',
                            cursor: 'pointer',
                            transition: 'border-color .15s, background .15s',
                            boxShadow: sel ? `0 0 0 3px ${DS.blue100}` : 'none',
                        }}>
                        <div style={{ fontFamily: DS.ff, ...TY.b3, fontWeight: 600, color: DS.textDefault, marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'left' }}>
                            {c.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <TypeTag type={c.type} />
                            <span style={{ fontFamily: DS.ff, ...TY.b3, color: DS.textSecondary }}>{c.startDate}</span>
                            {c.revenue && <span style={{ fontFamily: DS.ff, ...TY.b3, color: DS.actionPrimary, fontWeight: 600 }}>{c.revenue}€</span>}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// Date input styled to DS
function DateInput({ id, value, onChange, label }) {
    const [foc, setFoc] = useState(false);
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: DS.ff, ...TY.b3, color: DS.textSecondary }}>{label}</span>
            <input
                type="date"
                id={id}
                value={value}
                onChange={e => onChange(e.target.value)}
                onFocus={() => setFoc(true)}
                onBlur={() => setFoc(false)}
                style={{
                    height: 32, padding: '0 10px', borderRadius: 6,
                    border: `1px solid ${foc ? DS.borderFocus : DS.borderDefault}`,
                    background: DS.bgSurface, color: DS.textDefault,
                    fontFamily: DS.ff, fontSize: 12, cursor: 'pointer', outline: 'none',
                }}
            />
        </div>
    );
}

function FunnelView() {
    const [activeTab, setActiveTab] = useState('campaign');
    const [selectedId, setSelectedId] = useState(campaigns[0].id);
    const [dateFrom, setDateFrom] = useState('2024-07-01');
    const [dateTo, setDateTo] = useState('2024-08-29');
    const [typeFilter, setTypeFilter] = useState('all');

    // Per-campaign funnel
    const selectedCampaign = useMemo(() => campaigns.find(c => c.id === selectedId), [selectedId]);
    const singleSteps = useMemo(() => buildCampaignSteps(selectedCampaign), [selectedCampaign]);

    // Aggregated funnel
    const aggregatedSteps = useMemo(() => {
        const parseDash = s => new Date(s);
        const from = parseDash(dateFrom);
        const to = parseDash(dateTo);

        const filtered = campaigns.filter(c => {
            const [d, m, y] = c.startDate.split('/').map(Number);
            const date = new Date(y, m - 1, d);
            const inRange = date >= from && date <= to;
            const inType = typeFilter === 'all' || c.type === typeFilter;
            return inRange && inType;
        });

        if (!filtered.length) return null;

        const isSmsOnly = filtered.every(c => c.type === 'SMS');
        const totalSent = filtered.reduce((a, c) => a + (c.delivered ? Math.round(c.delivered / 0.97) : 0), 0);
        const totalDelivered = filtered.reduce((a, c) => a + (c.delivered || 0), 0);
        const withOpens = filtered.filter(c => c.openRate && c.delivered && c.type !== 'SMS');
        const totalOpens = withOpens.reduce((a, c) => a + Math.round(c.delivered * c.openRate / 100), 0);
        const withClicks = filtered.filter(c => c.clickRate && c.delivered);
        const totalClicks = withClicks.reduce((a, c) => a + Math.round(c.delivered * c.clickRate / 100), 0);
        const totalRevenue = filtered.reduce((a, c) => a + (c.revenue || 0), 0);

        return {
            steps: [
                { label: 'Sent',      value: totalSent,      color: FUNNEL_STEP_COLORS[0] },
                { label: 'Delivered', value: totalDelivered, color: FUNNEL_STEP_COLORS[1] },
                ...(!isSmsOnly ? [{ label: 'Opened', value: totalOpens || null, color: FUNNEL_STEP_COLORS[2] }] : []),
                { label: 'Clicked',   value: totalClicks || null, color: FUNNEL_STEP_COLORS[3] },
                ...(totalRevenue > 0 ? [{ label: 'Revenue', value: totalRevenue, color: FUNNEL_STEP_COLORS[4], isEuro: true }] : []),
            ],
            count: filtered.length,
            filtered,
        };
    }, [dateFrom, dateTo, typeFilter]);

    const tabStyle = active => ({
        padding: '8px 14px', fontFamily: DS.ff, ...TY.b2, cursor: 'pointer',
        color: active ? DS.actionPrimary : DS.textSecondary,
        background: 'none', border: 'none',
        borderBottom: `2px solid ${active ? DS.navActiveTab : 'transparent'}`,
        transition: 'color .15s, border-color .15s',
    });

    return (
        <div style={{ background: DS.bgCard, border: `1px solid ${DS.borderDefault}`, borderRadius: 10, margin: '16px 24px', padding: '20px 24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: DS.blue100, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <IcoX.Funnel s={16} c={DS.actionPrimary} />
                </div>
                <div style={{ fontFamily: DS.ff, ...TY.h5, color: DS.textDefault, textTransform: 'uppercase', letterSpacing: .5 }}>
                    Campaign funnel — sends, opens & clicks
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${DS.borderDefault}`, marginBottom: 20 }}>
                <button style={tabStyle(activeTab === 'campaign')} onClick={() => setActiveTab('campaign')}>Per campaign</button>
                <button style={tabStyle(activeTab === 'daterange')} onClick={() => setActiveTab('daterange')}>By date range</button>
            </div>

            {/* Tab: Per campaign */}
            {activeTab === 'campaign' && (
                <div>
                    <div style={{ fontFamily: DS.ff, ...TY.b3, fontWeight: 600, color: DS.textSecondary, textTransform: 'uppercase', letterSpacing: .6, marginBottom: 10, textAlign: 'left' }}>
                        Select a campaign
                    </div>
                    <CampaignSelector selectedId={selectedId} onChange={setSelectedId} />
                    <FunnelChart
                        steps={singleSteps}
                        title={selectedCampaign.name}
                        subtitle={`${selectedCampaign.type} · ${selectedCampaign.startDate}${selectedCampaign.objective === 'Conversion' ? ' · Conversion objective' : ''}${selectedCampaign.revenue ? ' · ' + selectedCampaign.revenue + '€ revenue' : ''}`}
                    />
                </div>
            )}

            {/* Tab: By date range */}
            {activeTab === 'daterange' && (
                <div>
                    {/* Toolbar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
                        <DateInput id="df" label="From" value={dateFrom} onChange={setDateFrom} />
                        <DateInput id="dt" label="To" value={dateTo} onChange={setDateTo} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontFamily: DS.ff, ...TY.b3, color: DS.textSecondary }}>Type</span>
                            <select
                                value={typeFilter}
                                onChange={e => setTypeFilter(e.target.value)}
                                style={{
                                    height: 32, padding: '0 28px 0 10px', borderRadius: 6,
                                    border: `1px solid ${DS.borderDefault}`, background: DS.bgSurface,
                                    color: DS.textDefault, fontFamily: DS.ff, fontSize: 12, cursor: 'pointer',
                                    appearance: 'none',
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5 8l5 5 5-5' stroke='%239A9EA5' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                                    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center',
                                }}>
                                <option value="all">All types</option>
                                <option value="Email">Email</option>
                                <option value="Transactional">Transactional</option>
                                <option value="SMS">SMS</option>
                                <option value="Manual">Manual</option>
                            </select>
                        </div>
                    </div>

                    {/* Result */}
                    {!aggregatedSteps ? (
                        <div style={{ textAlign: 'center', padding: '40px 20px', fontFamily: DS.ff, ...TY.b2, color: DS.textSecondary }}>
                            No campaigns found in this date range.
                        </div>
                    ) : (
                        <div>
                            {/* Matched campaign pills */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                                {aggregatedSteps.filtered.map(c => (
                                    <div key={c.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 10, background: DS.blue100, border: `1px solid ${DS.borderDefault}` }}>
                                        <TypeTag type={c.type} />
                                        <span style={{ fontFamily: DS.ff, ...TY.b3, color: DS.textDefault, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {c.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <FunnelChart
                                steps={aggregatedSteps.steps}
                                title={`Aggregated funnel — ${aggregatedSteps.count} campaign${aggregatedSteps.count > 1 ? 's' : ''}`}
                                subtitle={`${dateFrom.split('-').reverse().join('/')} → ${dateTo.split('-').reverse().join('/')}${typeFilter !== 'all' ? ' · ' + typeFilter : ''}`}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TABLE — DS-compliant
   ═══════════════════════════════════════════════════════════════════════════ */
const cols = [
    { key: "name", label: "Campaign name", minW: 200 },
    { key: "startDate", label: "Start date", minW: 120 },
    { key: "endDate", label: "End date", minW: 120 },
    { key: "type", label: "Type", minW: 120 },
    { key: "cost", label: "Cost", minW: 90, align: 'right' },
    { key: "objective", label: "Objective", minW: 110 },
    { key: "revenue", label: "Revenue", minW: 130, align: 'right' },
    { key: "actions", label: "Details", minW: 70, sortable: false },
];

function CampaignTable({ onSelect }) {
    const [sk, setSk] = useState("startDate");
    const [sd, setSd] = useState("desc");
    const [sel, setSel] = useState({});

    const toggleSort = k => {
        if (cols.find(c => c.key === k)?.sortable === false) return;
        if (sk === k) setSd(d => d === "asc" ? "desc" : "asc");
        else { setSk(k); setSd("asc"); }
    };

    const sorted = useMemo(() => [...campaigns].sort((a, b) => {
        const av = a[sk], bv = b[sk];
        if (av == null) return 1; if (bv == null) return -1;
        const c = av < bv ? -1 : av > bv ? 1 : 0;
        return sd === "asc" ? c : -c;
    }), [sk, sd]);

    const allSel = campaigns.every(c => sel[c.id]);

    const thS = {
        background: DS.blue100,
        border: `0.2px solid ${DS.borderDefault}`,
        padding: '12px',
        fontFamily: DS.ff,
        ...TY.h5,
        color: DS.textDefault,
        userSelect: 'none',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        textAlign: 'left',
    };

    return (
        <div style={{ background: DS.bgCard, border: `1px solid ${DS.borderDefault}`, borderRadius: 10, margin: '12px 24px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: `1px solid ${DS.borderDefault}`, background: DS.bgCard, borderRadius: '10px 10px 0 0' }}>
                <span style={{ fontFamily: DS.ff, ...TY.h5, color: DS.textDefault }}>
                    {campaigns.length} campaigns
                </span>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
                    <thead>
                        <tr>
                            <th style={{ ...thS, width: 44, minWidth: 44, cursor: 'default', textAlign: 'center' }}>
                                <input type="checkbox" checked={allSel}
                                    onChange={() => allSel ? setSel({}) : setSel(Object.fromEntries(campaigns.map(c => [c.id, true])))}
                                    style={{ cursor: 'pointer', width: 16, height: 16, accentColor: DS.actionPrimary }} />
                            </th>
                            {cols.map(col => (
                                <th key={col.key} onClick={() => toggleSort(col.key)}
                                    style={{ ...thS, minWidth: col.minW, textAlign: col.align || 'left' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: col.align === 'right' ? 'flex-end' : 'flex-start' }}>
                                        {col.label}
                                        {col.sortable !== false && (
                                            <span style={{ display: 'inline-flex', opacity: sk === col.key ? 1 : 0.35 }}>
                                                <Ico.SortUp s={14} c={sk === col.key ? DS.actionPrimary : DS.textSecondary} />
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {sorted.map(c => (
                            <CRow key={c.id} c={c} selected={!!sel[c.id]}
                                onToggle={() => setSel(s => ({ ...s, [c.id]: !s[c.id] }))}
                                onOverview={() => onSelect(c)} />
                        ))}
                    </tbody>
                </table>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderTop: `1px solid ${DS.borderDefault}`, borderRadius: '0 0 10px 10px', background: DS.bgCard }}>
                <span style={{ fontFamily: DS.ff, ...TY.b3, color: DS.textSecondary }}>Showing 1–{sorted.length} of {campaigns.length}</span>
                <div style={{ display: 'flex', gap: 4 }}>
                    <Btn type="Secondary" size="Small" label="Prev" />
                    <Btn type="Primary" size="Small" label="1" />
                    <Btn type="Secondary" size="Small" label="Next" />
                </div>
            </div>
        </div>
    );
}

function CRow({ c, selected, onToggle, onOverview }) {
    const [hov, setHov] = useState(false);
    const tdS = {
        background: hov || selected ? DS.blue100 : DS.bgCard,
        borderLeft: `0.5px solid ${DS.borderDefault}`,
        borderTop: `0.5px solid ${DS.borderDefault}`,
        padding: '12px',
        fontFamily: DS.ff,
        ...TY.b3,
        color: DS.neutralBlack,
        transition: 'background .1s',
    };
    return (
        <tr onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
            <td style={{ ...tdS, textAlign: 'center', width: 44, minWidth: 44 }}>
                <input type="checkbox" checked={selected} onChange={onToggle}
                    style={{ cursor: 'pointer', width: 16, height: 16, accentColor: DS.actionPrimary }} />
            </td>
            <td style={{ ...tdS, maxWidth: 220, minWidth: 200 }}>
                <span style={{ color: DS.actionPrimary, cursor: 'pointer', display: 'block', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', ...TY.b3 }} title={c.name}>{c.name}</span>
            </td>
            <td style={tdS}>{c.startDate}</td>
            <td style={tdS}>{c.endDate}</td>
            <td style={tdS}><TypeTag type={c.type} /></td>
            <td style={{ ...tdS, textAlign: 'right' }}>{c.cost}€</td>
            <td style={tdS}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 999, background: c.objective === 'Conversion' ? DS.feedbackSuccessBg : DS.bgSurface, ...TY.b3, color: c.objective === 'Conversion' ? DS.feedbackSuccess : DS.textSecondary, fontFamily: DS.ff }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.objective === 'Conversion' ? DS.feedbackSuccess : DS.textSecondary, flexShrink: 0 }} />
                    {c.objective === 'Conversion' ? 'Conversion' : 'None'}
                </span>
            </td>
            <td style={{ ...tdS, textAlign: 'right', color: c.revenue != null ? DS.actionPrimary : DS.textSecondary, fontWeight: c.revenue != null ? 600 : 400 }}>
                {c.revenue != null ? `${c.revenue}€` : "N/A"}
            </td>
            <td style={{ background: hov || selected ? DS.blue100 : DS.bgCard, borderLeft: `0.5px solid ${DS.borderDefault}`, borderRight: `0.5px solid ${DS.borderDefault}`, borderTop: `0.5px solid ${DS.borderDefault}`, padding: '0 16px', height: 36, textAlign: 'center', transition: 'background .1s' }}>
                <IconBtn icon={<Ico.Eye s={16} c={DS.actionPrimary} />} type="Secondary" size="Small" onClick={onOverview} />
            </td>
        </tr>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SIDEBAR
   ═══════════════════════════════════════════════════════════════════════════ */
function StatRow({ label, value, sub, color, compact = false }) {
    return (
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: compact ? '8px 0' : '10px 0', borderBottom: `0.5px solid ${DS.borderDefault}` }}>
            <span style={{ fontFamily: DS.ff, ...TY.b2, color: DS.textSecondary, textAlign: 'left', flex: 1 }}>{label}</span>
            <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                <div style={{ fontFamily: DS.ff, ...TY.h5, color: color || DS.actionPrimary }}>{value}</div>
                {sub && <div style={{ fontFamily: DS.ff, ...TY.b3, color: DS.textSecondary }}>{sub}</div>}
            </div>
        </div>
    );
}

function InfoRow({ label, value }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingBottom: 10 }}>
            <span style={{ fontFamily: DS.ff, ...TY.b2, color: DS.textSecondary, textAlign: 'left' }}>{label}</span>
            <span style={{ fontFamily: DS.ff, ...TY.b2, color: DS.neutralBlack, textAlign: 'left' }}>{value || '—'}</span>
        </div>
    );
}

function SectionHeader({ label, open, onToggle }) {
    const [hov, setHov] = useState(false);
    return (
        <button
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            onClick={onToggle}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '8px 0', background: 'none', border: 'none', cursor: 'pointer', borderBottom: `0.5px solid ${DS.borderDefault}`, marginBottom: 4 }}>
            <span style={{ fontFamily: DS.ff, ...TY.h4, color: DS.blue600, textAlign: 'left' }}>{label}</span>
            <span style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s', display: 'inline-flex' }}>
                <Ico.ChevDown s={16} c={DS.blue600} />
            </span>
        </button>
    );
}

function Sidebar({ c, onClose }) {
    const [vis, setVis] = useState(false);
    const [infoOpen, setInfoOpen] = useState(true);
    const [statsOpen, setStatsOpen] = useState(true);
    const isSms = c.type === "SMS";

    useEffect(() => { const t = setTimeout(() => setVis(true), 10); return () => clearTimeout(t); }, []);
    const close = () => { setVis(false); setTimeout(onClose, 280); };
    useEffect(() => {
        const fn = e => { if (e.key === "Escape") close(); };
        window.addEventListener("keydown", fn);
        return () => window.removeEventListener("keydown", fn);
    }, []);

    return <>
        <div onClick={close} style={{ position: 'fixed', inset: 0, background: 'rgba(31,41,55,.35)', opacity: vis ? 1 : 0, transition: 'opacity .28s ease', zIndex: 100 }} />
        <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: 500,
            background: DS.bgCard, border: `1px solid ${DS.borderDefault}`,
            boxShadow: '-4px 0 24px rgba(0,0,0,.12)',
            transform: vis ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform .28s cubic-bezier(.4,0,.2,1)',
            zIndex: 101, display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
            <div style={{ padding: '16px 20px', borderBottom: `0.5px solid ${DS.borderDefault}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0, minHeight: 100 }}>
                <div style={{ flex: 1, marginRight: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <TypeTag type={c.type} />
                        {c.objective === "Conversion" && <Tag text="Conversion" color={DS.feedbackSuccess} />}
                    </div>
                    <div style={{ fontFamily: DS.ff, ...TY.h4, color: DS.textDefault, marginBottom: 4, textAlign: 'left' }}>{c.name}</div>
                    <div style={{ fontFamily: DS.ff, ...TY.b3, color: DS.textSecondary, textAlign: 'left' }}>
                        {c.startDate}{c.startDate !== c.endDate ? ` → ${c.endDate}` : ''}
                    </div>
                </div>
                <button onClick={close} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 4, display: 'flex', flexShrink: 0 }}>
                    <Ico.Cross s={20} c={DS.textSecondary} />
                </button>
            </div>
            {c.revenue != null && (
                <div style={{ margin: '12px 20px 0', padding: '12px 16px', borderRadius: 10, background: DS.blue100, border: `1px solid ${DS.blue300}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Ico.Cart s={16} c={DS.actionPrimary} />
                        <span style={{ fontFamily: DS.ff, ...TY.b2, color: DS.actionPrimary, textAlign: 'left' }}>Revenue generated</span>
                    </div>
                    <span style={{ fontFamily: DS.ff, ...TY.h3, color: DS.actionPrimary }}>{c.revenue}€</span>
                </div>
            )}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px 24px' }}>
                <div style={{ marginTop: 16 }}>
                    <SectionHeader label="Campaign info" open={infoOpen} onToggle={() => setInfoOpen(o => !o)} />
                    {infoOpen && (
                        <div style={{ paddingTop: 8 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                                <InfoRow label="Campaign type" value={c.type} />
                                <InfoRow label="Objective" value={c.objective === 'Conversion' ? 'Conversion' : 'None'} />
                                <InfoRow label="Start date" value={c.startDate} />
                                <InfoRow label="End date" value={c.endDate} />
                                <InfoRow label="Campaign cost" value={`${c.cost}€`} />
                                <InfoRow label="Recipients" value={c.delivered?.toLocaleString()} />
                            </div>
                            {c.cost > 0 && c.revenue && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px', marginTop: 4 }}>
                                    <InfoRow label="ROI" value={`${((c.revenue - c.cost) / c.cost * 100).toFixed(0)}%`} />
                                    <InfoRow label="Cost / conversion" value={`${(c.cost / (c.delivered * (c.clickRate ?? 1) / 100)).toFixed(2)}€`} />
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div style={{ marginTop: 16 }}>
                    <SectionHeader label="Performance" open={statsOpen} onToggle={() => setStatsOpen(o => !o)} />
                    {statsOpen && (
                        <div style={{ paddingTop: 4 }}>
                            <div style={{ fontFamily: DS.ff, ...TY.b3, color: DS.textSecondary, textTransform: 'uppercase', letterSpacing: .8, fontWeight: 600, margin: '10px 0 2px', textAlign: 'left' }}>Deliverability</div>
                            <StatRow label="Sent" value={c.delivered?.toLocaleString() ?? "N/A"} color={DS.textDefault} />
                            <StatRow label="Delivered"
                                value={c.delivered ? `${Math.round(c.delivered * .97).toLocaleString()}` : "N/A"}
                                sub={c.delivered ? "97.0% of total sent" : null}
                                color={DS.feedbackSuccess} />
                            <StatRow label="Bounces"
                                value={c.bounceRate != null ? `${c.bounceRate}%` : "N/A"}
                                sub={c.bounceRate != null ? `${Math.round(c.delivered * c.bounceRate / 100)} contacts` : null}
                                color={c.bounceRate != null ? (c.bounceRate > 2 ? DS.feedbackError : DS.feedbackWarning) : DS.textSecondary} />
                            <StatRow label="Unsubscribes"
                                value={c.unsubscribes != null ? String(c.unsubscribes) : "N/A"}
                                color={c.unsubscribes != null ? (c.unsubscribes > 5 ? DS.feedbackWarning : DS.textDefault) : DS.textSecondary} />
                            <div style={{ fontFamily: DS.ff, ...TY.b3, color: DS.textSecondary, textTransform: 'uppercase', letterSpacing: .8, fontWeight: 600, margin: '14px 0 2px', textAlign: 'left' }}>Engagement</div>
                            {!isSms && (
                                <StatRow label="Open rate"
                                    value={c.openRate != null ? `${c.openRate}%` : "N/A"}
                                    sub={c.openRate && c.delivered ? `${Math.round(c.delivered * c.openRate / 100)} openers` : null}
                                    color={c.openRate != null ? (c.openRate > 35 ? DS.feedbackSuccess : DS.feedbackWarning) : DS.textSecondary} />
                            )}
                            <StatRow label="Click rate"
                                value={c.clickRate != null ? `${c.clickRate}%` : "N/A"}
                                sub={c.clickRate && c.delivered ? `${Math.round(c.delivered * c.clickRate / 100)} clicks` : null}
                                color={c.clickRate != null ? (c.clickRate > 8 ? DS.feedbackSuccess : DS.feedbackWarning) : DS.textSecondary} />
                            {!isSms && c.openRate && c.clickRate && (
                                <StatRow label="CTOR (clicks / openers)"
                                    value={`${(c.clickRate / c.openRate * 100).toFixed(1)}%`}
                                    color={DS.actionPrimary} />
                            )}
                            {isSms && (
                                <div style={{ fontFamily: DS.ff, ...TY.b3, color: DS.textSecondary, padding: '8px 0', fontStyle: 'italic', textAlign: 'left' }}>
                                    Open rate is not available for SMS campaigns.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <div style={{ padding: '12px 20px', borderTop: `0.5px solid ${DS.borderDefault}`, display: 'flex', justifyContent: 'flex-end', gap: 8, flexShrink: 0 }}>
                <Btn type="Secondary" size="Medium" label="Close" onClick={close} />
                <Btn type="Primary" size="Medium" label="View campaign →" />
            </div>
        </div>
    </>;
}

/* ═══════════════════════════════════════════════════════════════════════════
   ROOT PAGE
   ═══════════════════════════════════════════════════════════════════════════ */
export default function PerformancesPage() {
    const [sidebar, setSidebar] = useState(null);

    const optionsItems = [
        { label: "Add campaign",      icon: <Ico.Plus     s={16} c={DS.textDefault} />, onClick: () => {} },
        { label: "Export CSV",        icon: <Ico.Download s={16} c={DS.textDefault} />, onClick: () => {} },
        { label: "Settings",          icon: <Ico.Settings s={16} c={DS.textDefault} />, onClick: () => {} },
        { label: "Import campaigns",  icon: <Ico.Plus     s={16} c={DS.textDefault} />, onClick: () => {} },
    ];

    return (
        <div style={{ background: DS.bgPage, minHeight: '100vh', fontFamily: DS.ff }}>

            {/* ── Page Header ── */}
            <div style={{
                background: DS.bgCard,
                borderBottom: `1px solid ${DS.borderDefault}`,
                padding: '16px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: DS.blue100, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <IcoX.ChartBar s={20} c={DS.actionPrimary} />
                    </div>
                    <div>
                        <div style={{ fontFamily: DS.ff, ...TY.h4, color: DS.textDefault, textAlign: 'left' }}>Performance</div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Btn type="Primary" size="Medium" label="Filters" iconLeft={<Ico.Filter s={16} c={DS.textInverse} />} />
                    <OptionsMenu items={optionsItems} />
                </div>
            </div>

            {/* ── Body ── */}
            <div style={{ paddingTop: 20, paddingBottom: 40 }}>
                <KpiBar />
                <ChartView />
                <FunnelView />      {/* ← NEW funnel chart, inserted between ChartView and CampaignTable */}
                <CampaignTable onSelect={setSidebar} />
            </div>

            {sidebar && <Sidebar c={sidebar} onClose={() => setSidebar(null)} />}
        </div>
    );
}