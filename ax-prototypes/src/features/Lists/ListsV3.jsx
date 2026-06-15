/**
 * Lists V3 — Contact Lists management (CRM > Contacts)
 * Built via the design-prototypes workflow. PAGE ONLY — renders inside the app
 * shell. Imports the shared design system + components; only BUILD-NEW pieces
 * (Select, Chip, KPI card, table, drawers, criteria editor) are local.
 */
import { useState } from 'react';
import { DS, TY } from '../../utils/designSystem';
import Ico from '../../utils/icons';
import { Btn } from '../../components/Btn';
import { IconBtn } from '../../components/Iconbtn';
import { Field, TextArea, SearchField } from '../../components/Field';
import { StatusBadge, Avatar, Tag } from '../../components/Tag';
import { Modal } from '../../components/Modal';
import StatePreview from '../../components/StatePreview';
import Skel from '../../components/Skeleton';
import KpiCard from '../../components/Kpi';
import Banner from '../../components/Banner';
import PageHeader from '../../components/PageHeader';
import Select from '../../components/Select';
import Pagination from '../../components/Pagination';
import Chip from '../../components/Chip';
import ActionMenu from '../../components/ActionMenu';
import Toast from '../../components/Toast';
import { EmptyState, ErrorState, ConfirmDialog } from '../../components/Feedback';

/* ── Helpers ────────────────────────────────────────────────────────────────── */
const TODAY = new Date('2026-06-05T00:00:00');
const d = (s) => new Date(s + 'T00:00:00');
const fmtDate = (dt) => dt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
const num = (n) => (n == null ? '—' : new Intl.NumberFormat('fr-FR').format(n));
const relDate = (s) => {
  const dt = d(s); const days = Math.round((TODAY - dt) / 86400000);
  if (days <= 0) return "aujourd'hui";
  if (days === 1) return 'hier';
  if (days < 30) return `il y a ${days} j`;
  return fmtDate(dt);
};

/* ── Mock data ──────────────────────────────────────────────────────────────── */
const OWNERS = ['Camille Rey', 'Hugo Martin', 'Léa Dubois', 'Yanis Benali'];
const SAMPLE_CONTACTS = [
  'Sophie Marchand', 'Thomas Lefèvre', 'Inès Bernard', 'Lucas Moreau', 'Emma Girard',
  'Nathan Roussel', 'Chloé Faure', 'Adam Lopez', 'Manon Henry', 'Gabriel Petit',
];
const FIELDS = ['Ville', 'Pays', 'Tags', 'Dernier achat', 'Score RFM', 'Canal préféré'];
const OPS = ['est', "n'est pas", 'contient', '>', '<'];

function buildLists() {
  return [
    { id: 'l1', name: 'Clients VIP — Top 5 %', description: 'Meilleurs clients par chiffre d’affaires annuel.', type: 'dynamic', contacts: 1240, owner: 'Camille Rey', created: '2025-11-02', updated: '2026-06-05', status: 'active', tags: ['VIP', 'Fidélité'], criteria: [{ field: 'Score RFM', op: '>', value: '450' }, { field: 'Dernier achat', op: '<', value: '60 jours' }] },
    { id: 'l2', name: 'Newsletter — Abonnés actifs', description: 'Contacts ayant ouvert un email sur les 90 derniers jours.', type: 'dynamic', contacts: 28940, owner: 'Hugo Martin', created: '2025-09-14', updated: '2026-06-03', status: 'active', tags: ['Email'], criteria: [{ field: 'Canal préféré', op: 'est', value: 'Email' }] },
    { id: 'l3', name: 'Prospects salon Paris 2026 — édition printemps porte de Versailles', description: 'Leads collectés sur le stand.', type: 'static', contacts: 412, owner: 'Léa Dubois', created: '2026-03-21', updated: '2026-05-28', status: 'active', tags: ['Événement', 'Prospect'], criteria: [] },
    { id: 'l4', name: 'Boutique Lyon — clients locaux', description: 'Clients rattachés au point de vente de Lyon.', type: 'dynamic', contacts: 3120, owner: 'Yanis Benali', created: '2025-12-08', updated: '2026-05-30', status: 'active', tags: ['Boutique'], criteria: [{ field: 'Ville', op: 'est', value: 'Lyon' }] },
    { id: 'l5', name: 'Réengagement — inactifs 6 mois', description: '', type: 'dynamic', contacts: 8760, owner: 'Camille Rey', created: '2026-01-19', updated: '2026-04-12', status: 'active', tags: ['Winback'], criteria: [{ field: 'Dernier achat', op: '>', value: '180 jours' }] },
    { id: 'l6', name: 'Liste import CSV — Mars (à nettoyer)', description: 'Import manuel, doublons à vérifier.', type: 'import', contacts: 0, owner: 'Hugo Martin', created: '2026-03-02', updated: '2026-03-02', status: 'active', tags: ['Import'], criteria: [] },
    { id: 'l7', name: 'Membres programme fidélité', description: 'Détenteurs de la carte de fidélité.', type: 'dynamic', contacts: 52310, owner: 'Léa Dubois', created: '2025-07-22', updated: '2026-06-01', status: 'active', tags: ['Fidélité', 'Wallet'], criteria: [{ field: 'Tags', op: 'contient', value: 'Carte fidélité' }] },
    { id: 'l8', name: 'VIP — invitations soirée privée', description: 'Sélection manuelle pour l’événement du 20 juin.', type: 'static', contacts: 180, owner: 'Camille Rey', created: '2026-05-15', updated: '2026-06-04', status: 'active', tags: ['Événement', 'VIP'], criteria: [] },
    { id: 'l9', name: 'Acheteurs Black Friday 2025', description: 'Contacts ayant commandé pendant l’opération.', type: 'static', contacts: 6420, owner: 'Yanis Benali', created: '2025-12-01', updated: '2026-02-10', status: 'archived', tags: ['Promo'], criteria: [] },
    { id: 'l10', name: 'SMS — opt-in mobile', description: 'Contacts ayant consenti au canal SMS.', type: 'dynamic', contacts: 14200, owner: 'Hugo Martin', created: '2025-10-03', updated: '2026-05-20', status: 'active', tags: ['SMS', 'Consentement'], criteria: [{ field: 'Canal préféré', op: 'est', value: 'SMS' }] },
    { id: 'l11', name: 'Anniversaires du mois', description: 'Mise à jour automatique chaque mois.', type: 'dynamic', contacts: 2310, owner: 'Léa Dubois', created: '2026-02-28', updated: '2026-06-01', status: 'active', tags: ['Automation'], criteria: [{ field: 'Tags', op: 'contient', value: 'Anniversaire juin' }] },
    { id: 'l12', name: 'Grands comptes B2B', description: 'Structures avec plus de 50 contacts rattachés.', type: 'dynamic', contacts: 96, owner: 'Yanis Benali', created: '2025-08-30', updated: '2026-04-25', status: 'active', tags: ['B2B'], criteria: [{ field: 'Tags', op: 'contient', value: 'Grand compte' }] },
    { id: 'l13', name: 'Désabonnés — exclusion globale', description: 'À exclure de toutes les campagnes.', type: 'dynamic', contacts: 3870, owner: 'Hugo Martin', created: '2025-06-11', updated: '2026-05-12', status: 'active', tags: ['Suppression'], criteria: [{ field: 'Tags', op: 'contient', value: 'Désabonné' }] },
    { id: 'l14', name: 'Import Salesforce — comptes clés', description: 'Synchronisation ponctuelle depuis le CRM externe.', type: 'import', contacts: 2040, owner: 'Yanis Benali', created: '2026-05-18', updated: '2026-05-18', status: 'active', tags: ['Import', 'CRM'], criteria: [] },
  ];
}

/* ── Local BUILD-NEW atoms ──────────────────────────────────────────────────── */
const TYPES = {
  dynamic: { label: 'Dynamique',     long: 'Dynamique (auto)',        bg: DS.green100,   fg: DS.green500,   icon: Ico.Zap },
  static:  { label: 'Statique',      long: 'Statique (manuelle)',     bg: DS.orange100,  fg: DS.orange500,  icon: Ico.List },
  import:  { label: 'Import manuel', long: 'Import manuel (fichier)', bg: DS.neutral200, fg: DS.neutral700, icon: Ico.Download },
};
function TypeBadge({ type }) {
  const t = TYPES[type] || TYPES.static;
  const I = t.icon;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 999, padding: '3px 10px', background: t.bg, color: t.fg, ...TY.b3, fontWeight: 500, fontFamily: DS.ff }}>
      <I s={12} c={t.fg} />{t.label}
    </span>
  );
}

/* ── List banner (DS Banner pattern — ComponentBanner 418:1399) ─────────────── */
function ListBanner({ l, canManage, onOpen, onEdit, onDuplicate, onDelete, onToast }) {
  const t = TYPES[l.type] || TYPES.static;
  const TypeIcon = t.icon;
  return (
    <Banner
      onClick={() => onOpen(l.id)}
      dim={l.status === 'archived'}
      icon={<TypeIcon s={22} c={t.fg} />}
      iconBg={t.bg}
      title={l.name}
      badge={l.status === 'archived' ? <StatusBadge status="warning">Archivée</StatusBadge> : null}
      description={l.description || 'Sans description'}
      columns={[
        { label: 'Type', basis: '116px', value: (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <TypeIcon s={14} c={t.fg} />{t.label}
          </span>
        ) },
        { label: 'Propriétaire', basis: '152px', value: (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <Avatar name={l.owner} size={22} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.owner}</span>
          </span>
        ) },
        { label: 'Mis à jour', basis: '104px', value: relDate(l.updated) },
        { label: 'Contacts', basis: '104px', value: <span style={{ ...TY.h5, color: DS.textDefault }}>{num(l.contacts)}</span> },
      ]}
      actions={
        <ActionMenu items={[
          { label: 'Voir', icon: <Ico.Eye s={16} c={DS.blue500} />, onClick: () => onOpen(l.id) },
          { label: 'Dupliquer', icon: <Ico.Copy s={16} c={DS.textSecondary} />, onClick: () => onDuplicate(l) },
          { label: 'Modifier', icon: <Ico.Edit s={16} c={DS.textSecondary} />, onClick: () => onEdit(l), hidden: !canManage },
          { label: 'Supprimer', icon: <Ico.Trash s={16} c={DS.feedbackError} />, onClick: () => onDelete(l), danger: true, hidden: !canManage },
          { label: 'Exporter', icon: <Ico.Download s={16} c={DS.textSecondary} />, onClick: () => onToast('Export généré (démo).'), hidden: canManage },
        ]} />
      }
    />
  );
}

/* ── Detail panel ───────────────────────────────────────────────────────────── */
function MetaRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${DS.borderDefault}` }}>
      <span style={{ ...TY.b2, color: DS.textSecondary, fontFamily: DS.ff }}>{label}</span>
      <span style={{ ...TY.b2, color: DS.textDefault, fontFamily: DS.ff, textAlign: 'right' }}>{value}</span>
    </div>
  );
}
function ListDetailPanel({ id, lists, dataState, onClose, onRetry, onEdit }) {
  const l = lists.find((x) => x.id === id);
  let bodyContent;
  let footer = null;
  if (dataState === 'loading') {
    bodyContent = <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}><Skel w="60%" h={18} /><Skel w="100%" h={70} /><Skel w="100%" h={120} /></div>;
  } else if (dataState === 'error') {
    bodyContent = <ErrorState title="Impossible de charger cette liste." retryLabel="Réessayer" onRetry={onRetry} />;
  } else if (!l) {
    bodyContent = <EmptyState icon={<Ico.Inbox s={24} />} title="Liste introuvable." />;
  } else {
    const sample = SAMPLE_CONTACTS.slice(0, Math.min(6, l.contacts));
    bodyContent = (
      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <TypeBadge type={l.type} />
          {l.status === 'archived' ? <StatusBadge status="warning">Archivée</StatusBadge> : <StatusBadge status="success">Active</StatusBadge>}
        </div>
        {l.description && <div style={{ ...TY.b2, color: DS.textDefault, fontFamily: DS.ff, marginBottom: 16 }}>{l.description}</div>}
        <MetaRow label="Contacts" value={num(l.contacts)} />
        <MetaRow label="Type" value={(TYPES[l.type] || TYPES.static).long} />
        <MetaRow label="Propriétaire" value={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Avatar name={l.owner} size={22} />{l.owner}</span>} />
        <MetaRow label="Créée le" value={fmtDate(d(l.created))} />
        <MetaRow label="Mise à jour" value={relDate(l.updated)} />
        {l.tags.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ ...TY.h5, color: DS.textDefault, fontFamily: DS.ff, marginBottom: 8 }}>Tags</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{l.tags.map((t) => <Tag key={t}>{t}</Tag>)}</div>
          </div>
        )}
        {l.type === 'dynamic' && l.criteria.length > 0 && (
          <div style={{ marginTop: 18 }}>
            <div style={{ ...TY.h5, color: DS.textDefault, fontFamily: DS.ff, marginBottom: 8 }}>Critères dynamiques</div>
            {l.criteria.map((cr, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: DS.bgSurface, border: `1px solid ${DS.borderDefault}`, borderRadius: 8, padding: '8px 12px', marginBottom: 8, ...TY.b3, fontFamily: DS.ff }}>
                <span style={{ color: DS.textDefault, fontWeight: 600 }}>{cr.field}</span>
                <span style={{ color: DS.textSecondary }}>{cr.op}</span>
                <span style={{ color: DS.actionPrimary }}>{cr.value}</span>
              </div>
            ))}
          </div>
        )}
        <div style={{ marginTop: 18 }}>
          <div style={{ ...TY.h5, color: DS.textDefault, fontFamily: DS.ff, marginBottom: 8 }}>Aperçu des contacts</div>
          {l.contacts === 0
            ? <EmptyState icon={<Ico.Users s={22} />} title="Cette liste est vide." sub="Ajoutez des contacts ou ajustez les critères." />
            : <div>
                {sample.map((nm) => (
                  <div key={nm} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid ${DS.borderDefault}` }}>
                    <Avatar name={nm} size={28} /><span style={{ ...TY.b2, color: DS.textDefault, fontFamily: DS.ff }}>{nm}</span>
                  </div>
                ))}
                {l.contacts > sample.length && <div style={{ ...TY.b3, color: DS.textSecondary, fontFamily: DS.ff, paddingTop: 10 }}>+ {num(l.contacts - sample.length)} autres contacts</div>}
              </div>}
        </div>
      </div>
    );
    footer = (
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', width: '100%' }}>
        <Btn type="Secondary" size="Medium" iconLeft={<Ico.Edit s={18} />} onClick={() => onEdit(l)}>Modifier</Btn>
        <Btn type="Primary" size="Medium" onClick={onClose}>Fermer</Btn>
      </div>
    );
  }
  return <Modal open onClose={onClose} title={l ? l.name : 'Liste'} footer={footer}>{bodyContent}</Modal>;
}

/* ── Create / edit panel ────────────────────────────────────────────────────── */
function ListFormPanel({ open, editing, onClose, onSave }) {
  const blank = { name: '', description: '', type: 'static', owner: OWNERS[0], tags: '', criteria: [] };
  const [form, setForm] = useState(blank);
  const [err, setErr] = useState({});
  const [confirmClose, setConfirmClose] = useState(false);
  const [wasOpen, setWasOpen] = useState(false);
  if (open !== wasOpen) { // render-time reset on open (no effect)
    setWasOpen(open);
    if (open) {
      setForm(editing
        ? { name: editing.name, description: editing.description, type: editing.type, owner: editing.owner, tags: editing.tags.join(', '), criteria: editing.criteria.map((c) => ({ ...c })) }
        : blank);
      setErr({}); setConfirmClose(false);
    }
  }
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const dirty = form.name !== '' || form.description !== '' || form.criteria.length > 0;
  const tryClose = () => { if (dirty) setConfirmClose(true); else onClose(); };
  const addCriterion = () => setForm((f) => ({ ...f, criteria: [...f.criteria, { field: FIELDS[0], op: OPS[0], value: '' }] }));
  const setCriterion = (i, k, v) => setForm((f) => ({ ...f, criteria: f.criteria.map((c, idx) => (idx === i ? { ...c, [k]: v } : c)) }));
  const removeCriterion = (i) => setForm((f) => ({ ...f, criteria: f.criteria.filter((_, idx) => idx !== i) }));
  const save = () => {
    const e = {}; if (!form.name.trim()) e.name = 'Le nom est requis.';
    if (form.type === 'dynamic' && form.criteria.length === 0) e.criteria = 'Une liste dynamique nécessite au moins un critère.';
    setErr(e); if (Object.keys(e).length) return; onSave(form, editing);
  };
  return (
    <>
      <Modal
        open={open}
        onClose={tryClose}
        title={editing ? 'Modifier la liste' : 'Créer une liste'}
        width={460}
        footer={(
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', width: '100%' }}>
            <Btn type="Tertiary" size="Medium" onClick={tryClose}>Annuler</Btn>
            <Btn type="Primary" size="Medium" iconLeft={<Ico.Check s={18} />} onClick={save}>{editing ? 'Enregistrer' : 'Créer la liste'}</Btn>
          </div>
        )}
      >
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="Nom de la liste" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="ex. Clients VIP — Paris" error={err.name} />
        <TextArea label="Description" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="À quoi sert cette liste ?" />
        <Select label="Type" value={form.type} onChange={(v) => set('type', v)} options={[{ value: 'dynamic', label: 'Dynamique — mise à jour automatique' }, { value: 'static', label: 'Statique — sélection manuelle' }, { value: 'import', label: 'Import manuel — depuis un fichier' }]} />
        <Select label="Propriétaire" value={form.owner} onChange={(v) => set('owner', v)} options={OWNERS.map((o) => ({ value: o, label: o }))} />
        {form.type === 'dynamic' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ ...TY.b2, color: DS.textSecondary, fontFamily: DS.ff }}>Critères</label>
              <Btn type="Tertiary" size="Small" iconLeft={<Ico.Plus s={14} />} onClick={addCriterion}>Ajouter</Btn>
            </div>
            {form.criteria.length === 0 && <div style={{ ...TY.b3, color: DS.textPlaceholder, fontFamily: DS.ff }}>Aucun critère — ajoutez-en un pour définir l’audience.</div>}
            {form.criteria.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Select value={c.field} onChange={(v) => setCriterion(i, 'field', v)} options={FIELDS.map((f) => ({ value: f, label: f }))} width={130} />
                <Select value={c.op} onChange={(v) => setCriterion(i, 'op', v)} options={OPS.map((o) => ({ value: o, label: o }))} width={92} />
                <Field value={c.value} onChange={(e) => setCriterion(i, 'value', e.target.value)} placeholder="valeur" style={{ flex: 1 }} />
                <IconBtn icon={<Ico.Trash s={16} c={DS.feedbackError} />} type="Secondary" size="Small" onClick={() => removeCriterion(i)} aria-label="Retirer" />
              </div>
            ))}
            {err.criteria && <span style={{ ...TY.b3, color: DS.feedbackError, fontFamily: DS.ff }}>{err.criteria}</span>}
          </div>
        )}
        <Field label="Tags (séparés par des virgules)" value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder="VIP, Fidélité" />
      </div>
      </Modal>
      {confirmClose && <ConfirmDialog title="Abandonner les modifications ?" body="Les informations saisies seront perdues." confirmLabel="Abandonner" cancelLabel="Annuler" confirmIcon={null} danger onConfirm={onClose} onCancel={() => setConfirmClose(false)} />}
    </>
  );
}

/* ── Demo toolbar (prototype aid) ───────────────────────────────────────────── */
/* ════════════════════════════════════════════════════════════════════════════
   PAGE
   ════════════════════════════════════════════════════════════════════════════ */
export default function ListsV3() {
  const [role, setRole] = useState('admin');
  const [dataState, setDataState] = useState('ready');
  const [lists, setLists] = useState(buildLists);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const showToast = (m) => { setToast(m); setTimeout(() => setToast(null), 2600); };
  const canManage = role === 'admin';

  const filtered = lists.filter((l) =>
    (typeFilter === 'all' || l.type === typeFilter) &&
    (query.trim() === '' || l.name.toLowerCase().includes(query.toLowerCase()) || l.description.toLowerCase().includes(query.toLowerCase()))
  );
  const pageSize = 8;
  const pages = Math.ceil(filtered.length / pageSize) || 1;
  const pageSafe = Math.min(page, pages - 1);
  const pageItems = filtered.slice(pageSafe * pageSize, (pageSafe + 1) * pageSize);

  const kpis = {
    total: lists.length,
    contacts: lists.reduce((a, l) => a + l.contacts, 0),
    dynamic: lists.filter((l) => l.type === 'dynamic').length,
    static: lists.filter((l) => l.type === 'static').length,
    import: lists.filter((l) => l.type === 'import').length,
    freshThisMonth: lists.filter((l) => { const u = d(l.updated); return u.getMonth() === TODAY.getMonth() && u.getFullYear() === TODAY.getFullYear(); }).length,
  };

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (l) => { setSelected(null); setEditing(l); setFormOpen(true); };
  const duplicate = (l) => { const id = 'l' + Date.now(); setLists((ls) => [{ ...l, id, name: l.name + ' (copie)', updated: '2026-06-05', created: '2026-06-05' }, ...ls]); showToast('Liste dupliquée.'); };
  const save = (form, edit) => {
    const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
    if (edit) {
      setLists((ls) => ls.map((l) => (l.id === edit.id ? { ...l, name: form.name, description: form.description, type: form.type, owner: form.owner, tags, criteria: form.criteria, updated: '2026-06-05' } : l)));
      showToast('Liste mise à jour.');
    } else {
      const id = 'l' + Date.now();
      setLists((ls) => [{ id, name: form.name, description: form.description, type: form.type, owner: form.owner, tags, criteria: form.criteria, contacts: form.type === 'dynamic' ? 0 : 0, status: 'active', created: '2026-06-05', updated: '2026-06-05' }, ...ls]);
      showToast('Liste créée.');
    }
    setFormOpen(false); setEditing(null);
  };
  const confirmDelete = () => { const t = deleteTarget; setLists((ls) => ls.filter((l) => l.id !== t.id)); setDeleteTarget(null); setSelected(null); showToast('Liste supprimée.'); };

  const body = () => {
    if (dataState === 'loading') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, background: DS.bgCard,
                                   border: `1px solid ${DS.borderDefault}`, borderRadius: 10, padding: '14px 16px' }}>
              <Skel w={44} h={44} r={10} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}><Skel w="40%" h={14} /><Skel w="60%" h={10} /></div>
              <Skel w={90} h={16} /><Skel w={90} h={16} /><Skel w={90} h={16} />
            </div>
          ))}
        </div>
      );
    }
    if (dataState === 'error') return <ErrorState title="Impossible de charger les listes." retryLabel="Réessayer" onRetry={() => setDataState('ready')} />;
    if (lists.length === 0) return <EmptyState icon={<Ico.List s={24} />} title="Aucune liste pour le moment" sub="Créez votre première liste de contacts pour segmenter votre CRM." cta={<Btn type="Primary" size="Medium" iconLeft={<Ico.Plus s={18} />} onClick={openCreate}>Créer une liste</Btn>} />;
    if (filtered.length === 0) return <EmptyState icon={<Ico.Search s={24} />} title="Aucun résultat" sub="Aucune liste ne correspond à votre recherche ou au filtre sélectionné." />;
    return (
      <>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {pageItems.map((l) => <ListBanner key={l.id} l={l} canManage={canManage} onOpen={(id) => setSelected(id)} onEdit={openEdit} onDuplicate={duplicate} onDelete={(x) => setDeleteTarget(x)} onToast={showToast} />)}
        </div>
        <Pagination page={pageSafe} pages={pages} setPage={setPage} prevLabel="Précédent" nextLabel="Suivant" />
      </>
    );
  };

  return (
    <div style={{ minHeight: '100%', paddingBottom: 48 }}>
      <StatePreview groups={[
        { label: 'Rôle', value: role, onChange: setRole,
          options: [{ id: 'admin', label: 'Admin' }, { id: 'user', label: 'Utilisateur' }] },
        { label: 'État', value: dataState, onChange: setDataState,
          options: [{ id: 'ready', label: 'Chargé' }, { id: 'loading', label: 'Chargement' }, { id: 'error', label: 'Erreur' }] },
      ]} />

      {/* Page header */}
      <PageHeader
        icon={<Ico.List s={20} c={DS.actionPrimary} />}
        title="Lists"
        description="Manage the contact lists in your CRM"
        actions={canManage && <Btn type="Primary" size="Medium" iconLeft={<Ico.Plus s={18} />} onClick={openCreate}>Create a list</Btn>}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 16 }}>
        {/* KPI strip */}
        <div style={{ margin: '0 24px', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <KpiCard loading={dataState === 'loading'} title="Listes" value={num(kpis.total)} sub="toutes confondues" icon={<Ico.List s={18} c={DS.actionPrimary} />} />
          <KpiCard loading={dataState === 'loading'} title="Contacts couverts" value={num(kpis.contacts)} sub="cumul (avec doublons)" icon={<Ico.Users s={18} c={DS.actionPrimary} />} />
          <KpiCard loading={dataState === 'loading'} title="Mises à jour ce mois" value={num(kpis.freshThisMonth)} sub="listes rafraîchies en juin" icon={<Ico.Zap s={18} c={DS.green500} />} accent={DS.green500} />
        </div>

        {/* List section — free-standing banners (no table card) */}
        <section style={{ margin: '0 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <Ico.Filter s={16} c={DS.textSecondary} />
              {[
                { k: 'all', l: 'Toutes', c: kpis.total },
                { k: 'dynamic', l: 'Dynamiques', c: kpis.dynamic, color: DS.green500 },
                { k: 'static', l: 'Statiques', c: kpis.static, color: DS.orange500 },
                { k: 'import', l: 'Imports', c: kpis.import, color: DS.neutral700 },
              ].map((o) => (
                <Chip key={o.k} label={`${o.l}  ${o.c}`} color={o.color} selected={typeFilter === o.k} onClick={() => { setTypeFilter(o.k); setPage(0); }} />
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <SearchField value={query} onChange={(e) => { setQuery(e.target.value); setPage(0); }} placeholder="Rechercher une liste…" />
              <Btn type="Secondary" size="Medium" iconLeft={<Ico.Download s={18} />} onClick={() => showToast('Export de toutes les listes (démo).')}>Exporter</Btn>
            </div>
          </div>
          {(query.trim() !== '' || typeFilter !== 'all') && (
            <div style={{ ...TY.b3, color: DS.textSecondary, fontFamily: DS.ff }}>{filtered.length} résultat{filtered.length > 1 ? 's' : ''}</div>
          )}
          {body()}
        </section>
      </div>

      {selected && <ListDetailPanel key={selected} id={selected} lists={lists} dataState={dataState} onClose={() => setSelected(null)} onRetry={() => setDataState('ready')} onEdit={openEdit} />}
      <ListFormPanel open={formOpen} editing={editing} onClose={() => { setFormOpen(false); setEditing(null); }} onSave={save} />
      {deleteTarget && <ConfirmDialog title="Supprimer cette liste ?" body={`« ${deleteTarget.name} » sera définitivement supprimée. Les contacts ne sont pas supprimés, seule la liste l’est.`} confirmLabel="Supprimer" cancelLabel="Annuler" danger onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} />}
      <Toast toast={toast} />
      <style>{KEYFRAMES}</style>
    </div>
  );
}

const KEYFRAMES = `
@keyframes lvShimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
@keyframes lvSlide { from { transform: translateX(100%); } to { transform: translateX(0); } }
@keyframes lvFade { from { opacity: 0; } to { opacity: 1; } }
`;
