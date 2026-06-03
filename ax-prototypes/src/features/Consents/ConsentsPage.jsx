import React from 'react';
import { DS, TY } from '../../utils/designSystem';
import Ico from '../../utils/icons';
import { Tag } from '../../components/Tag';
import Btn from '../../components/Btn';
import IconBtn from '../../components/Iconbtn';
import Field from '../../components/Field';

/* =====================================================================
   Arenametrix — Consent Management Page
   Tokens: AX Design System (NEW) — Figma NUOoC3GC7mB4U1AydRKIoy
   Rules: inline style only, DS/TY constants, Ico SVG pattern.
   ===================================================================== */

// ─────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────
const CONSENT_COLORS = {
  'newsletter-public': DS.blue500,
  'newsletter-vip':    DS.purple,
  'activites':         DS.orange,
  'sms':               DS.feedbackError,
  'whatsapp':          DS.teal500,
};

const MONTH_LABELS_FR = [
  'Mai 25','Juin 25','Juil. 25','Août 25','Sept. 25','Oct. 25',
  'Nov. 25','Déc. 25','Janv. 26','Févr. 26','Mars 26','Avr. 26','Mai 26',
];

const CONSENTS = [
  {
    id: 'newsletter-public', name: 'Newsletter Public', channel: 'Email',
    description: 'Newsletter mensuelle envoyée à l\'ensemble du public ayant opté pour les communications marketing : actualités du club, billetterie, contenus rédactionnels.',
    createdAt: '2022-09-14', createdBy: 'Camille Rousseau', contactsTotal: 18420,
    series: [14210,14580,14930,15270,15640,16020,16380,16740,17120,17480,17820,18180,18420],
    legalBasis: 'Consentement explicite (Art. 6.1.a RGPD)', doubleOptIn: true,
    auditLog: [
      { author:'Camille Rousseau',    date:'2026-04-22', change:'Mise à jour du libellé d\'opt-in dans le formulaire d\'inscription site.' },
      { author:'Maxence Bourguignon', date:'2026-02-08', change:'Activation du double opt-in pour la newsletter.' },
      { author:'Léa Garcia',          date:'2025-11-30', change:'Synchronisation avec la liste \'Abonnés saison 25/26\'.' },
      { author:'Camille Rousseau',    date:'2025-09-04', change:'Ajout des contacts importés via Brevo (4 219 contacts).' },
      { author:'Camille Rousseau',    date:'2022-09-14', change:'Création du consentement.' },
    ],
  },
  {
    id: 'newsletter-vip', name: 'Newsletter VIP & Loges', channel: 'Email',
    description: 'Communications exclusives à destination des détenteurs d\'abonnements VIP, loges et hospitalités : invitations privées, avant-premières billetterie.',
    createdAt: '2023-06-02', createdBy: 'Thomas Léveillé', contactsTotal: 1284,
    series: [1102,1118,1140,1158,1172,1190,1208,1224,1238,1252,1264,1278,1284],
    legalBasis: 'Consentement explicite (Art. 6.1.a RGPD)', doubleOptIn: true,
    auditLog: [
      { author:'Thomas Léveillé', date:'2026-05-04', change:'Ajout de 12 contacts saisis manuellement (renouvellements de loges).' },
      { author:'Thomas Léveillé', date:'2026-01-15', change:'Modification de la description (mention des avant-premières).' },
      { author:'Léa Garcia',      date:'2025-08-18', change:'Création du consentement.' },
    ],
  },
  {
    id: 'activites', name: 'Activités & événements partenaires', channel: 'Email',
    description: 'Annonces d\'événements organisés en partenariat avec les sponsors et les organisations partenaires du club (tournois, stages, animations grand public).',
    createdAt: '2024-01-18', createdBy: 'Léa Garcia', contactsTotal: 6842,
    series: [5210,5380,5520,5680,5810,5940,6080,6210,6340,6470,6590,6720,6842],
    legalBasis: 'Consentement explicite (Art. 6.1.a RGPD)', doubleOptIn: false,
    auditLog: [
      { author:'Léa Garcia',          date:'2026-03-11', change:'Désactivation du double opt-in suite à validation DPO.' },
      { author:'Maxence Bourguignon', date:'2025-12-02', change:'Renommage : \'Activités\' → \'Activités & événements partenaires\'.' },
      { author:'Léa Garcia',          date:'2024-01-18', change:'Création du consentement.' },
    ],
  },
  {
    id: 'sms', name: 'SMS', channel: 'SMS',
    description: 'Notifications SMS transactionnelles & marketing : rappels de match, alertes billetterie, codes d\'accès. Coût par envoi — consentement à privilégier.',
    createdAt: '2021-03-29', createdBy: 'Maxence Bourguignon', contactsTotal: 2486,
    series: [4120,4040,3920,3810,3690,3540,3380,3210,3050,2890,2740,2610,2486],
    legalBasis: 'Consentement explicite (Art. 6.1.a RGPD)', doubleOptIn: false,
    auditLog: [
      { author:'Maxence Bourguignon', date:'2026-04-30', change:'Nettoyage : suppression de 312 contacts dont le téléphone n\'est plus valide.' },
      { author:'Camille Rousseau',    date:'2026-02-15', change:'Désinscription en masse suite à campagne mal ciblée (−480 contacts).' },
      { author:'Maxence Bourguignon', date:'2025-09-22', change:'Mise à jour du texte d\'opt-in suite à audit CNIL.' },
      { author:'Maxence Bourguignon', date:'2021-03-29', change:'Création du consentement.' },
    ],
  },
  {
    id: 'whatsapp', name: 'WhatsApp', channel: 'WhatsApp',
    description: 'Canal WhatsApp Business — communications conversationnelles pilotes avec les abonnés Premium. Phase de test, aucune campagne lancée pour le moment.',
    createdAt: '2026-04-29', createdBy: 'Maxence Bourguignon', contactsTotal: 0,
    series: [null,null,null,null,null,null,null,null,null,null,null,0,0],
    legalBasis: 'Consentement explicite (Art. 6.1.a RGPD) — en attente d\'activation', doubleOptIn: true,
    auditLog: [
      { author:'Maxence Bourguignon', date:'2026-04-29', change:'Création du consentement (canal en phase pilote, opt-in non publié).' },
    ],
  },
];

const DEFAULT_CHART_SELECTION = ['newsletter-public','newsletter-vip','activites','sms'];

const DATE_RANGES = [
  { id:'3m',  label:'3 mois',       months:3  },
  { id:'6m',  label:'6 mois',       months:6  },
  { id:'12m', label:'12 mois',      months:12 },
  { id:'ytd', label:'Depuis 01/01', months:5  },
];

// ─────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────
function fmtNumberFR(n) {
  if (n == null || isNaN(n)) return '—';
  return n.toLocaleString('fr-FR');
}
function fmtDateFR(d) {
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date)) return '—';
  return date.toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit', year:'numeric' });
}
function fmtDateLongFR(d) {
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date)) return '—';
  return date.toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' });
}
function fmtRelDayFR(d) {
  const date = d instanceof Date ? d : new Date(d);
  const days = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (days <= 0) return 'aujourd\'hui';
  if (days === 1) return 'hier';
  if (days < 7)  return `il y a ${days} jours`;
  if (days < 31) return `il y a ${Math.floor(days / 7)} sem.`;
  if (days < 365) return `il y a ${Math.floor(days / 30)} mois`;
  return `il y a ${Math.floor(days / 365)} an${Math.floor(days / 365) > 1 ? 's' : ''}`;
}
function channelIco(channel) {
  return { Email:'Mail', SMS:'SMS', WhatsApp:'WhatsApp' }[channel] ?? 'Mail';
}

// ─────────────────────────────────────────────────────────────────────
// ATOMS
// ─────────────────────────────────────────────────────────────────────

// SearchField
function SearchField({ value, onChange, placeholder = 'Rechercher…', style: styleProp }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <div style={{ height: 40, padding: '0 12px', borderRadius: 6,
                  border: `1px solid ${focused ? DS.borderFocus : DS.borderDefault}`,
                  background: DS.bgSurface,
                  display: 'flex', alignItems: 'center', gap: 8, ...styleProp }}>
      <Ico.Search s={16} c={DS.textSecondary} />
      <input value={value ?? ''} onChange={onChange} placeholder={placeholder}
             onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
             style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none',
                      ...TY.b2, fontFamily: DS.ff, color: DS.textDefault }} />
    </div>
  );
}

// Avatar — DS §4.6 colour logic: charCodeAt(0) % 4
const AVATAR_PALETTE = [
  { bg: DS.blue100,        fg: DS.actionPrimary  },
  { bg: DS.feedbackSuccessBg, fg: DS.feedbackSuccess },
  { bg: DS.feedbackWarningBg, fg: DS.feedbackWarning },
  { bg: DS.purpleLight,    fg: DS.purple         },
];
function Avatar({ name = '', size = 32 }) {
  const initials = name.split(/\s+/).map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  const palette  = AVATAR_PALETTE[(name.charCodeAt(0) || 0) % 4];
  return (
    <span style={{ width: size, height: size, borderRadius: '50%',
                   background: palette.bg, color: palette.fg,
                   ...TY.b3, fontFamily: DS.ff, fontWeight: TY.weightSemiBold,
                   display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {initials || '?'}
    </span>
  );
}

// Icon-badge — DS §4.7 (blue100 bg, borderRadius 6)
// size: "Medium" (width 40) | "Small" (28×28)
function IconBadge({ icon, size = 'Medium' }) {
  const isSmall = size === 'Small';
  return (
    <div style={{ background: DS.blue100, borderRadius: 6, padding: 10,
                  width: isSmall ? 28 : 40, height: isSmall ? 28 : undefined,
                  display: 'flex', alignItems: 'center',
                  justifyContent: isSmall ? 'center' : undefined, flexShrink: 0 }}>
      {icon}
    </div>
  );
}

// Checkbox — DS §4.3
function Checkbox({ checked, onChange, label, disabled }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
                    cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
                    ...TY.b2, fontFamily: DS.ff, color: DS.textDefault }}>
      <span style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                     border: `1px solid ${checked ? DS.actionPrimary : DS.textSecondary}`,
                     background: checked ? DS.actionPrimary : DS.bgCard,
                     display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        {checked && <Ico.Check s={12} c={DS.textInverse} />}
      </span>
      <input type="checkbox" checked={!!checked} disabled={disabled}
             onChange={(e) => onChange && onChange(e.target.checked)}
             style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
      {label}
    </label>
  );
}

// Toggle — DS §4.3 (32×16, neutralLGrey border when off)
function Toggle({ on, onChange, label }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
                    cursor: 'pointer', ...TY.b2, fontFamily: DS.ff, color: DS.textDefault }}>
      <span style={{ width: 32, height: 18, borderRadius: 100,
                     background: on ? DS.actionPrimary : DS.bgCard,
                     border: `1px solid ${on ? DS.actionPrimary : DS.neutralLGrey}`,
                     padding: 2, display: 'inline-flex', alignItems: 'center',
                     justifyContent: on ? 'flex-end' : 'flex-start',
                     transition: 'background 0.15s ease' }}
            onClick={() => onChange && onChange(!on)}>
        <span style={{ width: 12, height: 12, borderRadius: '50%',
                       background: on ? DS.textInverse : DS.textSecondary,
                       transition: 'background 0.15s ease' }} />
      </span>
      {label}
    </label>
  );
}

// Skeleton — DS loading placeholder (borderDefault bg, r:4)
function Skeleton({ width = '100%', height = 16, radius = 4, style: styleProp }) {
  return (
    <span aria-hidden="true" style={{
      display: 'inline-block', width, height, borderRadius: radius,
      background: DS.borderDefault, opacity: 0.5, ...styleProp }} />
  );
}

// StateBlock — empty / error centred state
function StateBlock({ icon, title, description, action, tone = 'muted', minHeight = 240 }) {
  const IcoComp = Ico[icon] ?? Ico.Scan;
  const iconC = tone === 'error' ? DS.feedbackError : DS.textSecondary;
  const iconBg = tone === 'error' ? DS.feedbackErrorBg : DS.bgSurface;
  return (
    <div style={{ minHeight, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 8, padding: 32, textAlign: 'center' }}>
      <div style={{ width: 56, height: 56, borderRadius: '50%', background: iconBg, color: iconC,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
        <IcoComp s={26} c={iconC} />
      </div>
      <div style={{ ...TY.h4, fontFamily: DS.ff, color: DS.textDefault }}>{title}</div>
      {description && <div style={{ ...TY.b2, fontFamily: DS.ff, color: DS.textSecondary, maxWidth: 420 }}>{description}</div>}
      {action && <div style={{ marginTop: 12 }}>{action}</div>}
    </div>
  );
}

// Underline tabs (page-level nav) — DS §4.1 Tab Small
function UnderlineTabs({ tabs, active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 24, borderBottom: `1px solid ${DS.borderDefault}` }}>
      {tabs.map((t) => {
        const isActive = t.id === active;
        return (
          <div key={t.id} onClick={() => onChange(t.id)}
               style={{ position: 'relative', padding: '12px 4px',
                        ...TY.b2, fontFamily: DS.ff,
                        color: isActive ? DS.actionPrimary : DS.navText,
                        cursor: 'pointer', userSelect: 'none' }}>
            {t.label}
            {isActive && (
              <span style={{ position: 'absolute', left: 0, right: 0, bottom: -1, height: 4,
                             background: DS.navActiveTab, borderRadius: '2px 2px 0 0' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// SECTION 1 — PAGE HEADER (DS §5 page layout)
// ─────────────────────────────────────────────────────────────────────
function ConsentHeader({ onCreate }) {
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 10 }}>
      {/* PageHeaderInfos — bgCard, borderBottom, p:'16px 24px' */}
      <div style={{ background: DS.bgCard, borderBottom: `1px solid ${DS.borderDefault}`,
                    padding: '16px 24px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Icon-badge — DS §4.7 Medium */}
          <IconBadge icon={<Ico.Scan s={20} c={DS.actionPrimary} />} size="Medium" />
          <h2 style={{ ...TY.h4, fontFamily: DS.ff, color: DS.textDefault, margin: 0 }}>Consentements</h2>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Btn type="Secondary" iconLeft={<Ico.Download />}>Exporter</Btn>
          <Btn type="Primary"   iconLeft={<Ico.Plus />}    onClick={onCreate}>Créer un consentement</Btn>
        </div>
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────
// SECTION 2 — CHART
// ─────────────────────────────────────────────────────────────────────
function ConsentChart({ state, consents, selection, onSelectionChange, range, onRangeChange, onRetry }) {
  return (
    <section style={{ background: DS.bgCard, border: `1px solid ${DS.borderDefault}`,
                      borderRadius: 10, overflow: 'hidden' }}>
      {/* Card header */}
      <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <h3 style={{ ...TY.h3, fontFamily: DS.ff, color: DS.textDefault, margin: 0 }}>Évolution des consentements</h3>
          <div style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary }}>
            Volumes mensuels de contacts ayant donné leur consentement, par canal.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <IconBtn icon={<Ico.Refresh s={18} c={DS.actionPrimary} />} aria-label="Rafraîchir" />
          <IconBtn icon={<Ico.Download s={18} c={DS.actionPrimary} />} aria-label="Exporter le graphique" />
          <IconBtn icon={<Ico.Dots s={18} c={DS.actionPrimary} />} aria-label="Plus d'options" />
        </div>
      </div>

      {/* Controls bar — bgSurface toolbar */}
      <div style={{ padding: '12px 20px', background: DS.bgSurface,
                    borderTop: `1px solid ${DS.borderDefault}`, borderBottom: `1px solid ${DS.borderDefault}`,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    gap: 16, flexWrap: 'wrap' }}>
        <ConsentSelector consents={consents} selection={selection} onChange={onSelectionChange} />
        <DateRangeTabs value={range} onChange={onRangeChange} />
      </div>

      {/* Chart body */}
      <div style={{ padding: 20, minHeight: 360 }}>
        {state === 'loading' && <ChartSkeleton />}
        {state === 'error' && (
          <StateBlock icon="Alert" tone="error"
            title="Impossible de charger les données du graphique"
            description="Une erreur réseau est survenue. Veuillez réessayer dans quelques instants."
            action={<Btn type="Secondary" iconLeft={<Ico.Refresh />} onClick={onRetry}>Réessayer</Btn>} />
        )}
        {state === 'empty' && (
          <StateBlock icon="Scan"
            title="Aucune donnée de consentement disponible"
            description="Créez un premier consentement pour visualiser l'évolution de vos communautés."
            action={<Btn type="Primary" iconLeft={<Ico.Plus />}>Créer un consentement</Btn>} />
        )}
        {state === 'ready' && (
          <ChartCanvas consents={consents} selection={selection}
                       months={range.months} allLabels={MONTH_LABELS_FR} />
        )}
      </div>
    </section>
  );
}

function ConsentSelector({ consents, selection, onChange }) {
  const [open, setOpen] = React.useState(false);
  const wrapRef = React.useRef(null);
  React.useEffect(() => {
    function onDoc(e) { if (open && wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);
  function toggle(id) {
    onChange(selection.includes(id) ? selection.filter((x) => x !== id) : [...selection, id]);
  }
  return (
    <div ref={wrapRef} style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
      <span style={{ ...TY.b2, fontFamily: DS.ff, color: DS.textSecondary, marginRight: 4 }}>
        Consentements affichés :
      </span>
      {selection.map((id) => {
        const c = consents.find((x) => x.id === id);
        if (!c) return null;
        return (
          <span key={id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
                                   padding: '3px 8px', background: DS.bgCard,
                                   border: `1px solid ${DS.borderDefault}`, borderRadius: 100,
                                   ...TY.b3, fontFamily: DS.ff, color: DS.textDefault,
                                   height: 28, boxSizing: 'border-box' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: CONSENT_COLORS[id] }} />
            {c.name}
            <button type="button" aria-label={`Retirer ${c.name}`} onClick={() => toggle(id)}
                    style={{ border: 'none', background: 'transparent', display: 'inline-flex',
                             alignItems: 'center', color: DS.textSecondary, cursor: 'pointer', padding: 0 }}>
              <Ico.Cross s={12} c={DS.textSecondary} />
            </button>
          </span>
        );
      })}
      <button type="button" onClick={() => setOpen((v) => !v)}
              style={{ height: 28, padding: '0 10px',
                       background: open ? DS.actionSecondaryHover : DS.bgCard,
                       border: `1px dashed ${DS.actionPrimary}`, color: DS.actionPrimary,
                       borderRadius: 100, display: 'inline-flex', alignItems: 'center', gap: 4,
                       ...TY.b3, fontFamily: DS.ff, fontWeight: TY.weightSemiBold, cursor: 'pointer' }}>
        <Ico.Plus s={14} c={DS.actionPrimary} />
        Ajouter un consentement
      </button>
      {open && (
        <div role="listbox" style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0,
                                      background: DS.bgCard, minWidth: 280,
                                      border: `1px solid ${DS.borderDefault}`, borderRadius: 4,
                                      boxShadow: '0 2px 4px rgba(0,0,0,0.08)', padding: 6, zIndex: 20 }}>
          {consents.map((c) => {
            const checked = selection.includes(c.id);
            return (
              <div key={c.id} role="option" aria-selected={checked} onClick={() => toggle(c.id)}
                   style={{ display: 'flex', alignItems: 'center', gap: 10,
                            padding: '8px 10px', borderRadius: 4, cursor: 'pointer',
                            background: checked ? DS.actionSecondaryHover : 'transparent' }}
                   onMouseEnter={(e) => { if (!checked) e.currentTarget.style.background = DS.bgSurface; }}
                   onMouseLeave={(e) => { if (!checked) e.currentTarget.style.background = 'transparent'; }}>
                <span style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                               border: `1px solid ${checked ? DS.actionPrimary : DS.textSecondary}`,
                               background: checked ? DS.actionPrimary : DS.bgCard,
                               display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  {checked && <Ico.Check s={11} c={DS.textInverse} />}
                </span>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: CONSENT_COLORS[c.id] }} />
                <span style={{ flex: 1, ...TY.b2, fontFamily: DS.ff, color: DS.textDefault }}>{c.name}</span>
                <span style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary }}>{c.channel}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DateRangeTabs({ value, onChange }) {
  return (
    <div style={{ display: 'inline-flex', padding: 4, background: DS.bgCard,
                  border: `1px solid ${DS.borderDefault}`, borderRadius: 6 }}>
      {DATE_RANGES.map((r) => {
        const active = r.id === value.id;
        return (
          <button key={r.id} type="button" onClick={() => onChange(r)}
                  style={{ padding: '6px 12px',
                           ...TY.b3, fontFamily: DS.ff,
                           fontWeight: active ? TY.weightSemiBold : TY.weightMedium,
                           color: active ? DS.actionPrimary : DS.textSecondary,
                           background: active ? DS.actionSecondaryHover : 'transparent',
                           border: 'none', borderRadius: 4, cursor: 'pointer' }}>
            {r.label}
          </button>
        );
      })}
    </div>
  );
}

function ChartCanvas({ consents, selection, months, allLabels }) {
  const W = 1080, H = 320;
  const PAD_L = 64, PAD_R = 24, PAD_T = 16, PAD_B = 36;
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;
  const labels = allLabels.slice(-Math.min(months + 1, allLabels.length));
  const selected = consents.filter((c) => selection.includes(c.id)).map((c) => ({
    ...c, points: c.series.slice(-Math.min(months + 1, c.series.length)),
  }));
  const allValues = selected.flatMap((s) => s.points).filter((v) => v != null);
  const yMax = niceCeil(allValues.length ? Math.max(...allValues) : 100);
  const xStep = innerW / Math.max(1, labels.length - 1);
  const xAt = (i) => PAD_L + i * xStep;
  const yAt = (v) => PAD_T + innerH - (v / yMax) * innerH;
  const [hoverIdx, setHoverIdx] = React.useState(null);
  const svgRef = React.useRef(null);
  function onMove(e) {
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    if (x < PAD_L - 8 || x > W - PAD_R + 8) { setHoverIdx(null); return; }
    setHoverIdx(Math.max(0, Math.min(labels.length - 1, Math.round((x - PAD_L) / xStep))));
  }
  const ticks = Array.from({ length: 5 }, (_, i) => Math.round((yMax / 4) * i));
  const xLabelEvery = Math.max(1, Math.ceil(labels.length / 12));
  return (
    <div style={{ position: 'relative' }}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} width="100%"
           style={{ display: 'block', overflow: 'visible' }}
           onMouseMove={onMove} onMouseLeave={() => setHoverIdx(null)}>
        {ticks.map((t, i) => {
          const y = yAt(t);
          return (
            <g key={i}>
              <line x1={PAD_L} x2={W - PAD_R} y1={y} y2={y}
                    stroke={DS.borderDefault} strokeWidth="1" strokeDasharray={i === 0 ? '0' : '3 3'} />
              <text x={PAD_L - 10} y={y + 4} textAnchor="end"
                    fontSize="11" fill={DS.textSecondary} fontFamily="Inter, sans-serif">
                {fmtNumberFR(t)}
              </text>
            </g>
          );
        })}
        {labels.map((l, i) => {
          if (i % xLabelEvery !== 0 && i !== labels.length - 1) return null;
          return (
            <text key={i} x={xAt(i)} y={H - PAD_B + 18} textAnchor="middle"
                  fontSize="11" fill={DS.textSecondary} fontFamily="Inter, sans-serif">{l}</text>
          );
        })}
        {hoverIdx != null && (
          <line x1={xAt(hoverIdx)} x2={xAt(hoverIdx)} y1={PAD_T} y2={H - PAD_B}
                stroke={DS.neutral200} strokeWidth="1" strokeDasharray="3 3" />
        )}
        {selected.map((s) => {
          const color = CONSENT_COLORS[s.id];
          const pts = s.points.map((v, i) => v != null ? { x: xAt(i), y: yAt(v) } : null).filter(Boolean);
          if (!pts.length) return null;
          let d = `M ${pts[0].x} ${pts[0].y}`;
          for (let i = 1; i < pts.length; i++) {
            const cx = (pts[i - 1].x + pts[i].x) / 2;
            d += ` C ${cx} ${pts[i - 1].y}, ${cx} ${pts[i].y}, ${pts[i].x} ${pts[i].y}`;
          }
          return (
            <g key={s.id}>
              <path d={d} fill="none" stroke={color} strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
              {s.points.map((v, i) => v == null ? null : (
                <circle key={i} cx={xAt(i)} cy={yAt(v)} r={hoverIdx === i ? 4.5 : 2.5}
                        fill={DS.bgCard} stroke={color} strokeWidth="2" />
              ))}
            </g>
          );
        })}
        {selected.length === 0 && (
          <text x={W / 2} y={H / 2} textAnchor="middle"
                fontSize="14" fill={DS.textSecondary} fontFamily="Inter, sans-serif">
            Sélectionnez au moins un consentement pour afficher le graphique.
          </text>
        )}
      </svg>
      {hoverIdx != null && selected.length > 0 && (
        <div style={{ position: 'absolute', left: `calc(${(xAt(hoverIdx) / W) * 100}% + 16px)`,
                      top: 16, background: DS.bgCard, border: `1px solid ${DS.borderDefault}`,
                      borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
                      padding: 12, minWidth: 220, pointerEvents: 'none', zIndex: 5 }}>
          <div style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary,
                        marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {labels[hoverIdx]}
          </div>
          {selected.map((s) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: CONSENT_COLORS[s.id] }} />
              <span style={{ flex: 1, ...TY.b2, fontFamily: DS.ff, color: DS.textDefault }}>{s.name}</span>
              <span style={{ ...TY.h5, fontFamily: DS.ff, color: DS.textDefault }}>
                {s.points[hoverIdx] == null ? '—' : fmtNumberFR(s.points[hoverIdx])}
              </span>
            </div>
          ))}
        </div>
      )}
      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 12, paddingTop: 12,
                    borderTop: `1px solid ${DS.borderDefault}` }}>
        {consents.map((s) => (
          <div key={s.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
                                    opacity: selection.includes(s.id) ? 1 : 0.4,
                                    ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary }}>
            <span style={{ width: 14, height: 3, borderRadius: 2, background: CONSENT_COLORS[s.id] }} />
            {s.name}
          </div>
        ))}
      </div>
    </div>
  );
}

function niceCeil(v) {
  if (v <= 0) return 100;
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  const base = v / pow;
  const nice = base <= 1 ? 1 : base <= 2 ? 2 : base <= 5 ? 5 : 10;
  return nice * pow;
}

function ChartSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: 320 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, flex: 1, padding: '16px 0' }}>
        {Array.from({ length: 13 }).map((_, i) => (
          <Skeleton key={i} width={`${100 / 13}%`} height={120 + ((i * 37) % 120)} radius={6} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} width={140} height={12} />)}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// SECTION 3 — BANNERS (DS §7 Banner component)
// ─────────────────────────────────────────────────────────────────────
function ConsentBanners({ consents, onOpen, onDelete }) {
  const [search, setSearch] = React.useState('');
  const filtered = consents.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.channel.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 4px 0' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <h3 style={{ ...TY.h3, fontFamily: DS.ff, color: DS.textDefault, margin: 0 }}>Liste des consentements</h3>
          <span style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary }}>
            {consents.length} consentement{consents.length > 1 ? 's' : ''}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <SearchField placeholder="Rechercher un consentement…" value={search}
                       onChange={(e) => setSearch(e.target.value)} style={{ width: 280 }} />
          <Btn type="Secondary" iconLeft={<Ico.Filter />}>Filtres</Btn>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map((c) => (
          <ConsentBanner key={c.id} consent={c} onOpen={() => onOpen(c)} onDelete={() => onDelete(c)} />
        ))}
        {filtered.length === 0 && (
          <div style={{ background: DS.bgCard, border: `1px solid ${DS.borderDefault}`, borderRadius: 10 }}>
            <StateBlock icon="Search" title="Aucun consentement trouvé"
                        description="Essayez de modifier votre recherche." />
          </div>
        )}
      </div>
    </section>
  );
}

// ConsentBanner — DS §7 Banner pattern
function ConsentBanner({ consent, onOpen, onDelete }) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [hover, setHover] = React.useState(false);
  const menuRef = React.useRef(null);
  React.useEffect(() => {
    function onDoc(e) { if (menuOpen && menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [menuOpen]);

  const last12 = consent.series.slice(-12);
  const nonNull = last12.filter((v) => v != null);
  const isZero  = consent.contactsTotal === 0;
  const first = nonNull[0] ?? 0;
  const last  = nonNull[nonNull.length - 1] ?? 0;
  const delta = first ? Math.round(((last - first) / first) * 100) : 0;
  const trend = isZero ? 'flat' : delta > 1 ? 'up' : delta < -1 ? 'down' : 'flat';

  const ChIco = channelIco(consent.channel);
  const ChIcoComp = Ico[ChIco] ?? Ico.Mail;

  return (
    // DS Banner container: bgCard, borderDefault, borderRadius 10, height 96, padding 24
    <div onClick={onOpen} role="button" tabIndex={0}
         onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(); } }}
         onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
         style={{
                  border: `1px solid ${hover ? DS.blue300 : DS.borderDefault}`,
                  borderRadius: 10, padding: '0 24px',
                  height: 96,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20,
                  cursor: 'pointer', transition: `border-color 0.15s ease, background 0.15s ease`,
                  background: hover ? DS.bgSurface : DS.bgCard }}>

      {/* BannerHead — Icon-badge + name/description */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', minWidth: 280 }}>
        <IconBadge icon={<ChIcoComp s={20} c={DS.actionPrimary} />} size="Medium" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingTop: 4, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ ...TY.h5, fontFamily: DS.ff, color: DS.textDefault,
                           overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {consent.name}
            </span>
            {consent.doubleOptIn && <Tag variant="info">Double opt-in</Tag>}
            {isZero && <Tag variant="warning">Phase pilote</Tag>}
          </div>
          <span style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary,
                         overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 320 }}>
            {consent.description}
          </span>
        </div>
      </div>

      {/* Column — Canal */}
      <BannerColumn label="CANAL"
        value={<div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ChIcoComp s={14} c={DS.textSecondary} />
          <span style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textDefault }}>{consent.channel}</span>
        </div>} />

      {/* Column — Créé le */}
      <BannerColumn label="CRÉÉ LE"
        value={<div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Ico.Calendar s={14} c={DS.textSecondary} />
          <span style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textDefault }}>{fmtDateFR(consent.createdAt)}</span>
        </div>} />

      {/* Column — Contacts + trend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingTop: 4 }}>
        <span style={{ ...TY.h5, fontFamily: DS.ff, color: DS.textSecondary,
                       textTransform: 'uppercase', letterSpacing: '0.04em' }}>CONTACTS</span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ ...TY.h5, fontFamily: DS.ff, color: isZero ? DS.textSecondary : DS.textDefault }}>
            {fmtNumberFR(consent.contactsTotal)}
          </span>
          {!isZero && (() => {
            const TrendIco = trend === 'up' ? Ico.TrendUp : trend === 'down' ? Ico.TrendDown : Ico.TrendFlat;
            const trendC   = trend === 'up' ? DS.feedbackSuccess : trend === 'down' ? DS.feedbackError : DS.textSecondary;
            return (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2,
                             ...TY.b3, fontFamily: DS.ff, fontWeight: TY.weightSemiBold, color: trendC }}>
                <TrendIco s={14} c={trendC} />
                {delta > 0 ? '+' : ''}{delta}%
              </span>
            );
          })()}
        </div>
      </div>

      {/* Sparkline */}
      <div style={{ width: 120, height: 36, flexShrink: 0 }}>
        <Sparkline data={last12} color={CONSENT_COLORS[consent.id]} />
      </div>

      {/* Action — Secondary IconBtn (Dots) */}
      <div ref={menuRef} style={{ position: 'relative', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}
           onClick={(e) => e.stopPropagation()}>
        <IconBtn icon={<Ico.Dots s={18} c={DS.actionPrimary} />}
                 aria-label={`Actions pour ${consent.name}`}
                 active={menuOpen}
                 onClick={() => setMenuOpen((v) => !v)} />
        {menuOpen && (
          <div role="menu" onClick={(e) => e.stopPropagation()}
               style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0,
                        background: DS.bgCard, minWidth: 220,
                        border: `1px solid ${DS.borderDefault}`, borderRadius: 6,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.08)', padding: 4, zIndex: 10 }}>
            <DropdownMenuItem icon="Eye"   onClick={() => { setMenuOpen(false); onOpen(); }}>Ouvrir le détail</DropdownMenuItem>
            <DropdownMenuItem icon="Trash" tone="error" onClick={() => { setMenuOpen(false); onDelete(); }}>Supprimer</DropdownMenuItem>
          </div>
        )}
      </div>
    </div>
  );
}

// BannerColumn — reusable column block inside a Banner (DS §7)
function BannerColumn({ label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingTop: 4 }}>
      <span style={{ ...TY.h5, fontFamily: DS.ff, color: DS.textSecondary,
                     textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
      {typeof value === 'string'
        ? <span style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textDefault }}>{value}</span>
        : value}
    </div>
  );
}

// DropdownMenuItem — DS §4.9 dropdown item (h40, TY.b2, hover actionSecondaryHover)
function DropdownMenuItem({ icon, children, onClick, tone = 'default' }) {
  const [hover, setHover] = React.useState(false);
  const IcoComp = Ico[icon];
  const color   = tone === 'error' ? DS.feedbackError : DS.textDefault;
  const hoverBg = tone === 'error' ? DS.feedbackErrorBg : DS.actionSecondaryHover;
  return (
    <button type="button" role="menuitem" onClick={onClick}
            onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                     height: 40, padding: '0 10px',
                     background: hover ? hoverBg : 'transparent',
                     border: 'none', borderRadius: 4, color, cursor: 'pointer',
                     ...TY.b2, fontFamily: DS.ff }}>
      {IcoComp && <IcoComp s={16} c={color} />}
      {children}
    </button>
  );
}

function Sparkline({ data, color }) {
  const W = 120, H = 36;
  const nonNull = data.filter((v) => v != null);
  if (!nonNull.length || nonNull.every((v) => v === 0)) {
    return (
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
        <line x1="0" x2={W} y1={H - 2} y2={H - 2}
              stroke={DS.borderDefault} strokeWidth="1.5" strokeDasharray="3 3" />
      </svg>
    );
  }
  const min = Math.min(...nonNull), max = Math.max(...nonNull);
  const rng  = Math.max(1, max - min);
  const step = data.length > 1 ? W / (data.length - 1) : W;
  let d = '';
  data.forEach((v, i) => {
    if (v == null) return;
    const x = i * step;
    const y = H - 2 - ((v - min) / rng) * (H - 6);
    d += (d ? ' L' : 'M') + ` ${x.toFixed(1)} ${y.toFixed(1)}`;
  });
  const areaD = d ? `${d} L ${(data.length - 1) * step} ${H} L 0 ${H} Z` : '';
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none">
      <path d={areaD} fill={color} opacity="0.12" />
      <path d={d} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BannersSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{ background: DS.bgCard, border: `1px solid ${DS.borderDefault}`,
                              borderRadius: 10, padding: '0 24px', height: 96,
                              display: 'flex', alignItems: 'center', gap: 20 }}>
          <Skeleton width={40} height={40} radius={6} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Skeleton width={220} height={14} />
            <Skeleton width="60%" height={12} />
          </div>
          <Skeleton width={80} height={12} />
          <Skeleton width={80} height={12} />
          <Skeleton width={60} height={18} />
          <Skeleton width={120} height={28} radius={4} />
          <Skeleton width={28} height={28} radius={6} />
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// SECTION 4 — DETAIL MODAL (slide-in panel)
// ─────────────────────────────────────────────────────────────────────
function ConsentDetailModal({ state, consent, onClose, onRetry }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(31,41,55,0.35)',
                  zIndex: 100 }} onClick={onClose}>
      <aside onClick={(e) => e.stopPropagation()}
             role="dialog" aria-modal="true" aria-label="Détail du consentement"
             style={{ position: 'absolute', top: 0, right: 0, bottom: 0,
                      width: 560, maxWidth: '100vw', background: DS.bgCard,
                      display: 'flex', flexDirection: 'column',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
        {/* Header — nav gradient (DS navGradientFrom → navGradientTo) */}
        <div style={{ background: `linear-gradient(90deg, ${DS.navGradientFrom}, ${DS.navGradientTo})`,
                      padding: '16px 24px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, color: DS.textInverse }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
            <div style={{ ...TY.b3, fontFamily: DS.ff, opacity: 0.85 }}>Détail du consentement</div>
            <div style={{ ...TY.h3, fontFamily: DS.ff,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {state === 'ready' && consent ? consent.name : 'Consentement'}
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer"
                  style={{ width: 32, height: 32, padding: 0,
                           background: 'rgba(255,255,255,0.18)', border: 'none', borderRadius: 6,
                           color: DS.textInverse, cursor: 'pointer',
                           display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ico.Cross s={18} c={DS.textInverse} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', background: DS.bgPage }}>
          {state === 'loading' && <DetailSkeleton />}
          {state === 'error' && (
            <StateBlock icon="Alert" tone="error"
              title="Impossible de charger le détail"
              description="Une erreur réseau est survenue. Veuillez réessayer dans quelques instants."
              action={<Btn type="Secondary" iconLeft={<Ico.Refresh />} onClick={onRetry}>Réessayer</Btn>}
              minHeight={420} />
          )}
          {state === 'empty' && (
            <StateBlock icon="Scan"
              title="Aucun consentement sélectionné"
              description="Sélectionnez un consentement dans la liste pour afficher ses détails."
              minHeight={420} />
          )}
          {state === 'ready' && consent && <DetailBody consent={consent} />}
        </div>

        {/* Footer */}
        {state === 'ready' && consent && (
          <div style={{ padding: '16px 24px', background: DS.bgCard,
                        borderTop: `1px solid ${DS.borderDefault}`,
                        display: 'flex', gap: 12, justifyContent: 'space-between', alignItems: 'center' }}>
            <Btn type="Tertiary" iconLeft={<Ico.Trash />}>Supprimer</Btn>
            <div style={{ display: 'flex', gap: 12 }}>
              <Btn type="Secondary" onClick={onClose}>Fermer</Btn>
              <Btn type="Primary" iconLeft={<Ico.Edit />}>Modifier</Btn>
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
  const ChIco = channelIco(consent.channel);
  const ChIcoComp = Ico[ChIco] ?? Ico.Mail;
  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Hero card — DS card: bgCard, borderDefault, borderRadius 10 */}
      <div style={{ background: DS.bgCard, border: `1px solid ${DS.borderDefault}`,
                    borderRadius: 10, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <IconBadge icon={<ChIcoComp s={20} c={DS.actionPrimary} />} size="Medium" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ ...TY.h3, fontFamily: DS.ff, color: DS.textDefault, marginBottom: 4 }}>{consent.name}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Tag variant="info">{consent.channel}</Tag>
              {consent.doubleOptIn && <Tag variant="success">Double opt-in</Tag>}
              {isZero && <Tag variant="warning">Phase pilote — 0 contact</Tag>}
            </div>
          </div>
        </div>
        {/* Stat grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ padding: 12, borderRadius: 8, background: DS.bgSurface,
                        display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary,
                           textTransform: 'uppercase', letterSpacing: '0.04em' }}>Contacts</span>
            <span style={{ ...TY.h4, fontFamily: DS.ff, color: isZero ? DS.textSecondary : DS.actionPrimary }}>
              {fmtNumberFR(consent.contactsTotal)}
            </span>
            <span style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary }}>au {fmtDateFR('2026-05-13')}</span>
          </div>
          <div style={{ padding: 12, borderRadius: 8, background: DS.bgSurface,
                        display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary,
                           textTransform: 'uppercase', letterSpacing: '0.04em' }}>Tendance 12 mois</span>
            <div style={{ height: 44, marginTop: 2 }}>
              <Sparkline data={last12} color={CONSENT_COLORS[consent.id]} />
            </div>
          </div>
        </div>
      </div>

      {/* Properties card */}
      <PropertiesCard title="Propriétés">
        <PropertyRow label="Description">
          <p style={{ ...TY.b2, fontFamily: DS.ff, color: DS.textDefault, margin: 0 }}>{consent.description}</p>
        </PropertyRow>
        <PropertyRow label="Canal marketing">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <ChIcoComp s={16} c={DS.textSecondary} />
            <span style={{ ...TY.b2, fontFamily: DS.ff, color: DS.textDefault, fontWeight: TY.weightSemiBold }}>{consent.channel}</span>
          </span>
        </PropertyRow>
        <PropertyRow label="Base légale">
          <span style={{ ...TY.b2, fontFamily: DS.ff, color: DS.textDefault }}>{consent.legalBasis}</span>
        </PropertyRow>
        <PropertyRow label="Date de création">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Ico.Calendar s={14} c={DS.textSecondary} />
            <span style={{ ...TY.b2, fontFamily: DS.ff, color: DS.textDefault }}>{fmtDateLongFR(consent.createdAt)}</span>
            <span style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary }}>· par {consent.createdBy}</span>
          </span>
        </PropertyRow>
        <PropertyRow label="Double opt-in">
          <Toggle on={consent.doubleOptIn} label={consent.doubleOptIn ? 'Activé' : 'Désactivé'} />
        </PropertyRow>
        <PropertyRow label="Identifiant">
          <code style={{ ...TY.b3, fontFamily: DS.ff, background: DS.bgSurface,
                         border: `1px solid ${DS.borderDefault}`, borderRadius: 4, padding: '2px 6px',
                         color: DS.textSecondary }}>cnst_{consent.id}</code>
        </PropertyRow>
      </PropertiesCard>

      {/* Audit trail */}
      <div style={{ background: DS.bgCard, border: `1px solid ${DS.borderDefault}`,
                    borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      borderBottom: `1px solid ${DS.borderDefault}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Ico.Clock s={18} c={DS.actionPrimary} />
            <span style={{ ...TY.h4, fontFamily: DS.ff, color: DS.textDefault }}>Journal de modifications</span>
          </div>
          <span style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary }}>
            {consent.auditLog.length} entrée{consent.auditLog.length > 1 ? 's' : ''}
          </span>
        </div>
        <ol style={{ margin: 0, padding: '8px 16px 16px', listStyle: 'none' }}>
          {consent.auditLog.map((entry, i) => (
            <li key={i} style={{ display: 'grid', gridTemplateColumns: '20px 1fr', gap: 12,
                                  padding: '8px 0',
                                  borderBottom: i < consent.auditLog.length - 1
                                    ? `1px dashed ${DS.borderDefault}` : 'none' }}>
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', top: 0, bottom: 0, width: 1, background: DS.borderDefault }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%',
                              background: i === 0 ? DS.actionPrimary : DS.bgCard,
                              border: `2px solid ${i === 0 ? DS.actionPrimary : DS.neutral200}`,
                              marginTop: 6, position: 'relative', zIndex: 1 }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingTop: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <Avatar name={entry.author} size={20} />
                  <span style={{ ...TY.h5, fontFamily: DS.ff, color: DS.textDefault }}>{entry.author}</span>
                  <span style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary }}>
                    {fmtDateFR(entry.date)} · {fmtRelDayFR(entry.date)}
                  </span>
                </div>
                <div style={{ ...TY.b2, fontFamily: DS.ff, color: DS.textDefault }}>{entry.change}</div>
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
    <div style={{ background: DS.bgCard, border: `1px solid ${DS.borderDefault}`,
                  borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ padding: '14px 16px', borderBottom: `1px solid ${DS.borderDefault}`,
                    ...TY.h4, fontFamily: DS.ff, color: DS.textDefault }}>{title}</div>
      <dl style={{ margin: 0, padding: 0 }}>
        {React.Children.map(children, (child, i) =>
          React.cloneElement(child, { isFirst: i === 0 })
        )}
      </dl>
    </div>
  );
}

function PropertyRow({ label, children, isFirst }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', padding: '12px 16px', gap: 16,
                  borderTop: isFirst ? 'none' : `1px solid ${DS.borderDefault}`,
                  alignItems: 'flex-start' }}>
      <dt style={{ ...TY.b2, fontFamily: DS.ff, color: DS.textSecondary }}>{label}</dt>
      <dd style={{ margin: 0, ...TY.b2, fontFamily: DS.ff, color: DS.textDefault, minWidth: 0, wordBreak: 'break-word' }}>
        {children}
      </dd>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: DS.bgCard, border: `1px solid ${DS.borderDefault}`,
                    borderRadius: 10, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <Skeleton width={40} height={40} radius={6} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Skeleton width="60%" height={20} />
            <Skeleton width="40%" height={12} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Skeleton height={76} radius={8} />
          <Skeleton height={76} radius={8} />
        </div>
      </div>
      <div style={{ background: DS.bgCard, border: `1px solid ${DS.borderDefault}`,
                    borderRadius: 10, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Skeleton width="30%" height={16} />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 16 }}>
            <Skeleton height={14} /> <Skeleton height={14} width="70%" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// SECTION 5 — DELETE CONFIRM DIALOG
// ─────────────────────────────────────────────────────────────────────
function DeleteConfirm({ consent, onCancel, onConfirm }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(31,41,55,0.45)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}
         onClick={onCancel}>
      <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true"
           style={{ width: 480, maxWidth: 'calc(100vw - 40px)', background: DS.bgCard,
                    borderRadius: 10, overflow: 'hidden',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
        {/* Modal header — nav gradient */}
        <div style={{ background: `linear-gradient(90deg, ${DS.navGradientFrom}, ${DS.navGradientTo})`,
                      padding: '16px 24px', color: DS.textInverse,
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ ...TY.h3, fontFamily: DS.ff }}>Supprimer le consentement</span>
          <button type="button" onClick={onCancel} aria-label="Fermer"
                  style={{ width: 32, height: 32, padding: 0, background: 'rgba(255,255,255,0.18)',
                           border: 'none', borderRadius: 6, cursor: 'pointer',
                           display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ico.Cross s={18} c={DS.textInverse} />
          </button>
        </div>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ ...TY.b1, fontFamily: DS.ff, color: DS.textDefault, margin: 0 }}>
            Vous êtes sur le point de supprimer le consentement <strong>« {consent.name} »</strong>.
          </p>
          {/* Error feedback triad — §8 */}
          <div style={{ padding: 12, background: DS.feedbackErrorBg,
                        border: `1px solid ${DS.feedbackError}`, borderRadius: 6,
                        display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <Ico.Alert s={18} c={DS.feedbackError} style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ ...TY.b2, fontFamily: DS.ff, color: DS.feedbackErrorText }}>
              Cette action est irréversible. {fmtNumberFR(consent.contactsTotal)} contact
              {consent.contactsTotal > 1 ? 's seront' : ' sera'} dissociés de ce consentement.
            </div>
          </div>
        </div>
        <div style={{ padding: '16px 24px', borderTop: `1px solid ${DS.borderDefault}`,
                      background: DS.bgSurface,
                      display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <Btn type="Tertiary" onClick={onCancel}>Annuler</Btn>
          <Btn type="Danger"   iconLeft={<Ico.Trash />} onClick={onConfirm}>Supprimer</Btn>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// APP SHELL
// ─────────────────────────────────────────────────────────────────────
export default function ConsentsPage() {
  const [consents,      setConsents]      = React.useState(CONSENTS);
  const [selection,     setSelection]     = React.useState(DEFAULT_CHART_SELECTION);
  const [range,         setRange]         = React.useState(DATE_RANGES[2]);
  const [openConsent,   setOpenConsent]   = React.useState(null);
  const [modalState,    setModalState]    = React.useState('ready');
  const [chartView,     setChartView]     = React.useState('ready');
  const [listView,      setListView]      = React.useState('ready');
  const [confirmDelete, setConfirmDelete] = React.useState(null);

  function openDetail(c) {
    setOpenConsent(c);
    setModalState('loading');
    setTimeout(() => setModalState('ready'), 450);
  }
  function closeModal() { setOpenConsent(null); setModalState('ready'); }

  const chartConsents = listView === 'empty' ? [] : consents;
  const chartState    = listView === 'empty' ? 'empty' : chartView;

  return (
    // Root — DS §5: bg bgPage
    <div style={{ minHeight: '100vh', background: DS.bgPage }}>
      <ConsentHeader onCreate={() => alert('Création d\'un consentement — non maquetté dans ce prototype.')} />

      <main style={{ padding: '24px 24px 96px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <ConsentChart
          state={chartState} consents={chartConsents}
          selection={selection} onSelectionChange={setSelection}
          range={range} onRangeChange={setRange}
          onRetry={() => { setChartView('loading'); setTimeout(() => setChartView('ready'), 600); }} />

        {listView === 'ready' && (
          <ConsentBanners consents={consents} onOpen={openDetail}
                          onDelete={(c) => setConfirmDelete(c)} />
        )}
        {listView === 'loading' && <BannersSkeleton />}
        {listView === 'error' && (
          <div style={{ background: DS.bgCard, border: `1px solid ${DS.borderDefault}`, borderRadius: 10 }}>
            <StateBlock icon="Alert" tone="error"
              title="Impossible de charger les consentements"
              description="Une erreur réseau est survenue. Veuillez réessayer dans quelques instants."
              action={<Btn type="Secondary" iconLeft={<Ico.Refresh />} onClick={() => {
                setListView('loading');
                setTimeout(() => setListView('ready'), 700);
              }}>Réessayer</Btn>} />
          </div>
        )}
        {listView === 'empty' && (
          <div style={{ background: DS.bgCard, border: `1px solid ${DS.borderDefault}`, borderRadius: 10 }}>
            <StateBlock icon="Scan"
              title="Aucun consentement"
              description="Créez votre premier consentement pour commencer à suivre vos communautés."
              action={<Btn type="Primary" iconLeft={<Ico.Plus />}>Créer un consentement</Btn>} />
          </div>
        )}
      </main>

      {openConsent && (
        <ConsentDetailModal state={modalState}
                            consent={modalState === 'ready' ? openConsent : null}
                            onClose={closeModal}
                            onRetry={() => { setModalState('loading'); setTimeout(() => setModalState('ready'), 500); }} />
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
    </div>
  );
}