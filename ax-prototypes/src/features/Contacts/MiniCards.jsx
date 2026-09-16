import { useState } from "react";
import {DS} from "../../utils/designSystem";

// ── helpers ───────────────────────────────────────────────────────────────────

const fmt = (n, currency = "EUR") =>
    n == null ? "—" : new Intl.NumberFormat("en-GB", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);

function totalSpending(tickets = [], contributions = []) {
    const t = tickets.reduce((s, t) => s + (t.total ?? t.price * (t.quantity || 1) ?? 0), 0);
    const c = contributions.reduce((s, c) => s + (c.amount ?? 0), 0);
    return t + c;
}

function sparklinePoints(values, w = 64, h = 32) {
    if (values.length < 2) return "";
    const max = Math.max(...values, 1);
    const min = Math.min(...values);
    const range = max - min || 1;
    const step = w / (values.length - 1);
    return values.map((v, i) => `${i * step},${h - ((v - min) / range) * h}`).join(" ");
}

function monthlyTicketCounts(tickets = []) {
    const map = {};
    tickets.forEach(t => {
        const m = t.purchaseDate?.slice(0, 7);
        if (m) map[m] = (map[m] || 0) + (t.quantity || 1);
    });
    return Object.keys(map).sort().slice(-8).map(k => map[k]);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Sparkline({ values, color, w = 64, h = 32 }) {
    if (values.length < 2) return <svg width={w} height={h} />;
    const pts = sparklinePoints(values, w, h);
    const lastPt = pts.split(" ").pop().split(",");
    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" style={{ overflow: "visible" }}>
            <polyline points={pts} stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx={lastPt[0]} cy={lastPt[1]} r="3" fill={color} />
        </svg>
    );
}

function TinyDonut({ pct, color, size = 48, stroke = 6 }) {
    const trackColor = color + "25";
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const dash = (Math.min(pct, 100) / 100) * circ;
    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
            <circle
                cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke={color} strokeWidth={stroke}
                strokeDasharray={`${dash} ${circ}`}
                strokeLinecap="round"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
        </svg>
    );
}

function MiniBar({ pct, color }) {
    return (
        <div style={{ height: 4, background: color + "25", borderRadius: 2, overflow: "hidden", width: "100%" }}>
            <div style={{
                width: `${Math.min(pct, 100)}%`, height: "100%",
                background: color, borderRadius: 2, transition: "width .3s",
            }} />
        </div>
    );
}

// ── MiniCard shell ────────────────────────────────────────────────────────────

function MiniCard({ active, onClick, children, gridColumn }) {
    const [hov, setHov] = useState(false);
    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                gridColumn,
                background: DS.neutral0,
                border: `1px solid ${active ? DS.actionPrimary : hov ? DS.neutral500 : DS.neutral200}`,
                borderBottom: active ? `2px solid ${DS.actionPrimary}` : `1px solid ${hov ? DS.neutral500 : DS.neutral200}`,
                borderRadius: 8,
                padding: "14px 16px 12px",
                cursor: "pointer",
                transition: "border-color .15s",
                display: "flex", flexDirection: "column", gap: 10,
            }}
        >
            {children}
        </div>
    );
}

function CardLabel({ children, active }) {
    return (
        <span style={{
            fontFamily: DS.ff, fontSize: 10, fontWeight: 700,
            letterSpacing: ".08em", textTransform: "uppercase",
            color: active ? DS.actionPrimary : DS.neutral500,
            transition: "color .15s",
        }}>
            {children}
        </span>
    );
}

function BigNumber({ children }) {
    return (
        <span style={{ fontFamily: DS.ff, fontSize: 22, fontWeight: 700, color: DS.neutral900, lineHeight: 1 }}>
            {children}
        </span>
    );
}

function Sub({ children }) {
    return (
        <span style={{ fontFamily: DS.ff, fontSize: 11, color: DS.neutral500, display: "block", marginTop: 2 }}>
            {children}
        </span>
    );
}

// ── Exported component ────────────────────────────────────────────────────────

export default function MiniCards({
    tickets = [],
    contributions = [],
    campaigns = [],
    consents = [],
    accessControls = [],
    activeTab,
    onTabChange,
}) {
    // ① Purchase history
    const spending     = totalSpending(tickets, contributions);
    const ticketCounts = monthlyTicketCounts(tickets);
    const totalTickets = tickets.reduce((s, t) => s + (t.quantity || 1), 0);

    // ② Campaigns
    const totalCamp = campaigns.length;
    const openRate  = totalCamp > 0 ? Math.round((campaigns.filter(c => c.openedAt).length  / totalCamp) * 100) : 0;
    const clickRate = totalCamp > 0 ? Math.round((campaigns.filter(c => c.clickedAt).length / totalCamp) * 100) : 0;

    // ③ Consents
    const optins = consents.length;

    // ④ Access controls
    const visits     = accessControls.length;
    const recentDate = [...accessControls].sort((a, b) => new Date(b.assignedAt) - new Date(a.assignedAt))[0]?.assignedAt;

    // ⑤ Contributions
    const contribTotal = contributions.reduce((s, c) => s + (c.amount ?? 0), 0);
    const contribCount = contributions.length;

    const is = (tab) => activeTab === tab;

    const COLORS = {
        tickets:       DS.purple600,
        campaigns:     DS.amber600,
        consents:      DS.rose600,
        access:        DS.indigo800,
        contributions: DS.teal500,
    };

    return (
        <div style={{ padding: "16px 16px 0" }}>
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(6, 1fr)",
                gap: 8,
            }}>

                {/* Row 1 — 3 equal cards (each spans 2 of 6 columns) */}

                {/* 1 — Purchase history */}
                <MiniCard gridColumn="span 2" active={is("tickets")} onClick={() => onTabChange("tickets")}>
                    <CardLabel active={is("tickets")}>Purchase history</CardLabel>
                    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                        <div>
                            <BigNumber>{fmt(spending)}</BigNumber>
                            <Sub>{totalTickets} ticket{totalTickets !== 1 ? "s" : ""}</Sub>
                        </div>
                        <Sparkline
                            values={ticketCounts.length > 1 ? ticketCounts : [0, 0, 1]}
                            color={COLORS.tickets}
                        />
                    </div>
                </MiniCard>

                {/* 2 — Campaigns */}
                <MiniCard gridColumn="span 2" active={is("campaigns")} onClick={() => onTabChange("campaigns")}>
                    <CardLabel active={is("campaigns")}>Campaigns</CardLabel>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                <span style={{ fontFamily: DS.ff, fontSize: 11, color: DS.neutral500 }}>Open</span>
                                <span style={{ fontFamily: DS.ff, fontSize: 11, fontWeight: 600, color: DS.neutral900 }}>{openRate}%</span>
                            </div>
                            <MiniBar pct={openRate} color={COLORS.campaigns} />
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, marginBottom: 4 }}>
                                <span style={{ fontFamily: DS.ff, fontSize: 11, color: DS.neutral500 }}>Click</span>
                                <span style={{ fontFamily: DS.ff, fontSize: 11, fontWeight: 600, color: DS.neutral900 }}>{clickRate}%</span>
                            </div>
                            <MiniBar pct={clickRate} color={COLORS.campaigns} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 0 }}>
                            <TinyDonut pct={openRate} color={COLORS.campaigns} />
                            <span style={{ fontFamily: DS.ff, fontSize: 10, color: DS.neutral500 }}>{totalCamp} sent</span>
                        </div>
                    </div>
                </MiniCard>

                {/* 3 — Consents */}
                <MiniCard gridColumn="span 2" active={is("consents")} onClick={() => onTabChange("consents")}>
                    <CardLabel active={is("consents")}>Consents</CardLabel>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div>
                            <BigNumber>{optins}</BigNumber>
                            <Sub>opt-in{optins !== 1 ? "s" : ""}</Sub>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                            {consents.slice(0, 3).map((c, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                    <div style={{
                                        width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                                        background: COLORS.consents,
                                    }} />
                                    <span style={{
                                        fontFamily: DS.ff, fontSize: 10, color: DS.neutral500,
                                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 80,
                                    }}>
                                        {c.label || "—"}
                                    </span>
                                </div>
                            ))}
                            {consents.length === 0 && (
                                <span style={{ fontFamily: DS.ff, fontSize: 10, color: DS.neutral200 }}>No consent</span>
                            )}
                        </div>
                    </div>
                </MiniCard>

                {/* Row 2 — 2 equal cards (each spans 3 of 6 columns) */}

                {/* 4 — Access controls */}
                <MiniCard gridColumn="2 / span 2" active={is("access")} onClick={() => onTabChange("access")}>
                    <CardLabel active={is("access")}>Access control</CardLabel>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div>
                            <BigNumber>{visits}</BigNumber>
                            <Sub>visit{visits !== 1 ? "s" : ""}</Sub>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                            <TinyDonut pct={visits > 0 ? 100 : 0} color={COLORS.access} />
                            {recentDate && (
                                <span style={{ fontFamily: DS.ff, fontSize: 10, color: DS.neutral500 }}>
                                    {new Date(recentDate).toLocaleDateString("en-GB")}
                                </span>
                            )}
                        </div>
                    </div>
                </MiniCard>

                {/* 5 — Contributions */}
                <MiniCard gridColumn="4 / span 2" active={is("contributions")} onClick={() => onTabChange("contributions")}>
                    <CardLabel active={is("contributions")}>Contributions</CardLabel>
                    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                        <div>
                            <BigNumber>{fmt(contribTotal)}</BigNumber>
                            <Sub>{contribCount} item{contribCount !== 1 ? "s" : ""}</Sub>
                        </div>
                        <TinyDonut pct={contribCount > 0 ? 100 : 0} color={COLORS.contributions} />
                    </div>
                </MiniCard>

            </div>
        </div>
    );
}