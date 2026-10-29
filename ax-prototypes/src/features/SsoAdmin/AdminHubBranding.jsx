import React from 'react';
import { NavLink } from 'react-router-dom';
import { DS, TY } from '../../utils/designSystem';
import Ico from '../../utils/icons';
import { Btn } from '../../components/Btn';
import { Field } from '../../components/Field';
import { Select } from '../../components/Select';
import { PageHeader } from '../../components/PageHeader';
import { Modal } from '../../components/Modal';
import { Banner } from '../../components/Banner';
import { ActionMenu } from '../../components/ActionMenu';
import { StatusBadge } from '../../components/Tag';
import { EmptyState, ErrorState, ConfirmDialog } from '../../components/Feedback';
import { Skeleton } from '../../components/Skeleton';
import { Toast } from '../../components/Toast';
import { StatePreview } from '../../components/StatePreview';
import {
  BRANDING_ASSET,
  BRANDING_ASSET_EMPTY,
  CONTENT_PAGES,
  REDIRECT_LINKS,
  TRANSLATION_KEYS,
  AUDIT_LOG,
} from './ssoAdminMock';

let _uid = 1000;
const uid = () => String(_uid++);

const CURRENT_USER = 'Camille Laurent';

function nowLabel() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const TABS = [
  { id: 'branding', label: 'Branding', icon: Ico.Paint },
  { id: 'content', label: 'Content', icon: Ico.Field },
];

// ─── Small local building blocks (feature-local — not in the shared catalog) ──

function TabBar({ active, onChange }) {
  return (
    <div style={{ background: DS.bgCard, borderBottom: `1px solid ${DS.borderDefault}`, padding: '0 24px', display: 'flex', gap: 4 }}>
      {TABS.map((t) => {
        const isActive = t.id === active;
        const Icon = t.icon;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 16px',
              background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: DS.ff,
              ...TY.b2, fontWeight: isActive ? 600 : 400,
              color: isActive ? DS.actionPrimary : DS.textSecondary,
              borderBottom: isActive ? `3px solid ${DS.actionPrimary}` : '3px solid transparent',
              transition: 'color 0.15s, border-color 0.15s', marginBottom: -1,
            }}
          >
            <Icon s={16} c={isActive ? DS.actionPrimary : DS.textSecondary} />
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function SectionLabel({ children, actions }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <div style={{ ...TY.h5, fontFamily: DS.ff, color: DS.textDefault, textAlign: 'left' }}>{children}</div>
      {actions}
    </div>
  );
}

function ColorSwatch({ label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 20, height: 20, borderRadius: 5, background: value, border: `1px solid ${DS.borderDefault}`, flexShrink: 0 }} />
      <span style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary }}>{label} · {value}</span>
    </div>
  );
}

function LogoUploader({ logoUrl, onUpload }) {
  const inputRef = React.useRef(null);
  const [error, setError] = React.useState('');

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isValidType = file.type === 'image/png' || file.type === 'image/svg+xml';
    if (!isValidType) {
      setError('Only PNG or SVG files are accepted.');
    } else if (file.size > 2 * 1024 * 1024) {
      setError('File is larger than 2MB.');
    } else {
      setError('');
      onUpload(URL.createObjectURL(file));
    }
    e.target.value = '';
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{
        width: 72, height: 72, borderRadius: 10, background: DS.bgSurface,
        border: `1px solid ${DS.borderDefault}`, display: 'flex', alignItems: 'center',
        justifyContent: 'center', overflow: 'hidden', flexShrink: 0,
      }}>
        {logoUrl
          ? <img src={logoUrl} alt="Client logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          : <Ico.Card s={24} c={DS.textSecondary} />}
      </div>
      <div>
        <input ref={inputRef} type="file" accept="image/png,image/svg+xml" onChange={handleFile} style={{ display: 'none' }} />
        <Btn type="Secondary" size="Small" iconLeft={<Ico.Plus s={14} />} onClick={() => inputRef.current?.click()}>
          Upload new
        </Btn>
        <div style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary, marginTop: 6, textAlign: 'left' }}>
          PNG or SVG, up to 2MB
        </div>
        {error && (
          <div style={{ ...TY.b3, fontFamily: DS.ff, color: DS.feedbackError, marginTop: 4, textAlign: 'left' }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

function ColorEditModal({ open, colors, onClose, onSave }) {
  const [draft, setDraft] = React.useState(colors);
  React.useEffect(() => { if (open) setDraft(colors); }, [open, colors]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      variant="center"
      width={420}
      title="Edit colors"
      footer={
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
          <Btn type="Tertiary" onClick={onClose}>Cancel</Btn>
          <Btn type="Primary" onClick={() => onSave(draft)}>Save changes</Btn>
        </div>
      }
    >
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="Primary color" value={draft.primaryColor} onChange={(e) => setDraft({ ...draft, primaryColor: e.target.value })} />
        <Field label="Secondary color" value={draft.secondaryColor} onChange={(e) => setDraft({ ...draft, secondaryColor: e.target.value })} />
        <Field label="Accent color" value={draft.accentColor} onChange={(e) => setDraft({ ...draft, accentColor: e.target.value })} />
      </div>
    </Modal>
  );
}

const EMPTY_PAGE_DRAFT = { name: '', slug: '' };

function PagePanel({ open, initial, onClose, onSave }) {
  const [draft, setDraft] = React.useState(EMPTY_PAGE_DRAFT);
  const [confirmDiscard, setConfirmDiscard] = React.useState(false);
  const baseline = initial ? { name: initial.name, slug: initial.slug } : EMPTY_PAGE_DRAFT;
  const dirty = draft.name !== baseline.name || draft.slug !== baseline.slug;

  React.useEffect(() => {
    if (open) setDraft(initial ? { name: initial.name, slug: initial.slug } : EMPTY_PAGE_DRAFT);
  }, [open, initial]);

  const requestClose = () => {
    if (dirty) setConfirmDiscard(true);
    else onClose();
  };

  return (
    <>
      <Modal
        open={open}
        onClose={requestClose}
        variant="panel"
        title={initial ? 'Edit page' : 'Add page'}
        footer={
          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
            <Btn type="Tertiary" onClick={requestClose}>Cancel</Btn>
            <Btn type="Primary" disabled={!draft.name || !draft.slug} onClick={() => onSave(draft)}>
              {initial ? 'Save changes' : 'Add page'}
            </Btn>
          </div>
        }
      >
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Page name" value={draft.name} placeholder="e.g. FAQ" onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          <Field label="URL slug" value={draft.slug} placeholder="/faq" onChange={(e) => setDraft({ ...draft, slug: e.target.value })} />
        </div>
      </Modal>
      <ConfirmDialog
        open={confirmDiscard}
        title="Discard unsaved changes?"
        body="You have unsaved edits on this page. Closing now will discard them."
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        danger
        onConfirm={() => { setConfirmDiscard(false); onClose(); }}
        onCancel={() => setConfirmDiscard(false)}
      />
    </>
  );
}

function StatusPill({ status }) {
  return status === 'published'
    ? <StatusBadge status="success">Published</StatusBadge>
    : <StatusBadge status="inactive">Draft</StatusBadge>;
}

function RedirectRow({ link, onSave }) {
  const [draft, setDraft] = React.useState(link.targetUrl);
  const dirty = draft !== link.targetUrl;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
      <Field label={link.label} value={draft} placeholder="https://…" onChange={(e) => setDraft(e.target.value)} style={{ flex: 1 }} />
      <Btn type="Secondary" size="Small" disabled={!dirty} onClick={() => onSave(link, draft)}>Save</Btn>
    </div>
  );
}

function TranslationRow({ entry, language, onSave }) {
  const initialValue = entry[language] || '';
  const [draft, setDraft] = React.useState(initialValue);
  const dirty = draft !== initialValue;
  const missing = !initialValue;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
      <Field
        label={entry.key}
        value={draft}
        placeholder={missing ? 'Missing translation' : undefined}
        error={missing && !dirty ? `No ${language.toUpperCase()} translation yet` : undefined}
        onChange={(e) => setDraft(e.target.value)}
        style={{ flex: 1 }}
      />
      <Btn type="Secondary" size="Small" disabled={!dirty} onClick={() => onSave(entry.key, language, draft)}>Save</Btn>
    </div>
  );
}

// ─── Tabs ──────────────────────────────────────────────────────────────────

function BrandingTab({ asset, onUploadLogo, onEditColors, onFontChange, onSizeScaleChange }) {
  return (
    <div style={{ padding: 24, maxWidth: 720 }}>
      <SectionLabel>Logo</SectionLabel>
      <div style={{ marginBottom: 32 }}>
        <LogoUploader logoUrl={asset.logoUrl} onUpload={onUploadLogo} />
      </div>

      <SectionLabel
        actions={<Btn type="Secondary" size="Small" iconLeft={<Ico.Edit s={14} />} onClick={onEditColors}>Edit</Btn>}
      >
        Colors
      </SectionLabel>
      <div style={{ display: 'flex', gap: 20, paddingBottom: 32, borderBottom: `1px solid ${DS.borderDefault}`, marginBottom: 32 }}>
        <ColorSwatch label="Primary" value={asset.primaryColor} />
        <ColorSwatch label="Secondary" value={asset.secondaryColor} />
        <ColorSwatch label="Accent" value={asset.accentColor} />
      </div>

      <SectionLabel>Typography</SectionLabel>
      <div style={{ display: 'flex', gap: 16 }}>
        <Select
          label="Font"
          value={asset.fontFamily}
          onChange={onFontChange}
          width={200}
          options={[{ value: 'Inter', label: 'Inter' }, { value: 'Poppins', label: 'Poppins' }, { value: 'Roboto', label: 'Roboto' }]}
        />
        <Select
          label="Size scale"
          value={asset.sizeScale}
          onChange={onSizeScaleChange}
          width={160}
          options={[{ value: 'Small', label: 'Small' }, { value: 'Medium', label: 'Medium' }, { value: 'Large', label: 'Large' }]}
        />
      </div>
    </div>
  );
}

function ContentTab({
  pages, redirectLinks, translations, language, onLanguageChange,
  onAddPage, onEditPage, onDeletePage, onSaveRedirect, onSaveTranslation,
}) {
  return (
    <div style={{ padding: 24, maxWidth: 860 }}>
      <SectionLabel
        actions={<Btn type="Primary" size="Small" iconLeft={<Ico.Plus s={14} c={DS.textInverse} />} onClick={onAddPage}>Add page</Btn>}
      >
        Pages
      </SectionLabel>

      {pages.length === 0 ? (
        <div style={{ marginBottom: 32 }}>
          <EmptyState
            icon={<Ico.Field s={24} c={DS.textSecondary} />}
            title="No pages yet"
            sub="Add your first page to start customizing your My Account space."
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
          {pages.map((p) => (
            <Banner
              key={p.id}
              icon={<Ico.Field s={18} c={DS.actionPrimary} />}
              title={p.name}
              badge={<StatusPill status={p.status} />}
              description={p.slug}
              columns={[{ label: 'UPDATED', value: p.lastUpdated, basis: '110px' }]}
              actions={
                <ActionMenu items={[
                  { label: 'Edit', icon: <Ico.Edit s={16} c={DS.textSecondary} />, onClick: () => onEditPage(p) },
                  { label: 'Delete', icon: <Ico.Trash s={16} c={DS.feedbackError} />, onClick: () => onDeletePage(p), danger: true },
                ]} />
              }
            />
          ))}
        </div>
      )}

      <SectionLabel>Redirect links</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
        {redirectLinks.map((r) => (
          <RedirectRow key={r.id} link={r} onSave={onSaveRedirect} />
        ))}
      </div>

      <SectionLabel
        actions={
          <Select
            value={language}
            onChange={onLanguageChange}
            width={160}
            options={[{ value: 'fr', label: 'Français' }, { value: 'en', label: 'English' }]}
          />
        }
      >
        Texts &amp; translations
      </SectionLabel>
      {translations.length === 0 ? (
        <EmptyState
          icon={<Ico.Globe s={24} c={DS.textSecondary} />}
          title="No strings yet"
          sub="Translations will appear here once pages are added."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {translations.map((t) => (
            <TranslationRow key={`${t.key}-${language}`} entry={t} language={language} onSave={onSaveTranslation} />
          ))}
        </div>
      )}
    </div>
  );
}

function AuditLog({ entries }) {
  return (
    <div style={{ padding: '0 24px 32px' }}>
      <SectionLabel>Recent changes</SectionLabel>
      {entries.length === 0 ? (
        <EmptyState icon={<Ico.Clock s={24} c={DS.textSecondary} />} title="No changes yet" sub="Edits you make will show up here." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
          {entries.map((a) => (
            <Banner
              key={a.id}
              icon={<Ico.Clock s={16} c={DS.textSecondary} />}
              iconBg={DS.bgSurface}
              title={a.field}
              description={a.oldValue ? `${a.oldValue} → ${a.newValue || '—'}` : `Set to ${a.newValue || '—'}`}
              columns={[{ label: 'BY', value: a.user, basis: '130px' }, { label: 'WHEN', value: a.timestamp, basis: '130px' }]}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BrandingSkeleton() {
  return (
    <div style={{ padding: 24, maxWidth: 720 }}>
      <Skeleton w={80} h={12} r={4} style={{ marginBottom: 12 }} />
      <Skeleton w={72} h={72} r={10} style={{ marginBottom: 32 }} />
      <Skeleton w={80} h={12} r={4} style={{ marginBottom: 12 }} />
      <Skeleton w="100%" h={40} r={6} style={{ marginBottom: 32 }} />
      <Skeleton w={80} h={12} r={4} style={{ marginBottom: 12 }} />
      <Skeleton w="60%" h={40} r={6} />
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function AdminHubBranding() {
  const [demoState, setDemoState] = React.useState('ready');
  const [activeTab, setActiveTab] = React.useState('branding');

  const [brandingAsset, setBrandingAsset] = React.useState(BRANDING_ASSET);
  const [pages, setPages] = React.useState(CONTENT_PAGES);
  const [redirectLinks, setRedirectLinks] = React.useState(REDIRECT_LINKS);
  const [translations, setTranslations] = React.useState(TRANSLATION_KEYS);
  const [auditLog, setAuditLog] = React.useState(AUDIT_LOG);
  const [language, setLanguage] = React.useState('fr');

  const [colorModalOpen, setColorModalOpen] = React.useState(false);
  const [pagePanel, setPagePanel] = React.useState({ open: false, page: null });
  const [deleteTarget, setDeleteTarget] = React.useState(null);
  const [toast, setToast] = React.useState(null);

  React.useEffect(() => {
    if (demoState === 'empty') {
      setBrandingAsset(BRANDING_ASSET_EMPTY);
      setPages([]);
      setTranslations([]);
      setAuditLog([]);
    } else if (demoState === 'ready') {
      setBrandingAsset(BRANDING_ASSET);
      setPages(CONTENT_PAGES);
      setTranslations(TRANSLATION_KEYS);
      setAuditLog(AUDIT_LOG);
    }
  }, [demoState]);

  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2600); };

  const logChange = (field, oldValue, newValue) => {
    setAuditLog((log) => [{ id: uid(), timestamp: nowLabel(), user: CURRENT_USER, field, oldValue: oldValue ?? '', newValue: newValue ?? '' }, ...log]);
  };

  const handleUploadLogo = (url) => {
    logChange('Logo', brandingAsset.logoUrl ? 'previous logo' : '', 'new logo');
    setBrandingAsset((a) => ({ ...a, logoUrl: url }));
    notify('Logo updated — live on your fan-facing app.');
  };

  const handleSaveColors = (draft) => {
    if (draft.primaryColor !== brandingAsset.primaryColor) logChange('Primary color', brandingAsset.primaryColor, draft.primaryColor);
    if (draft.secondaryColor !== brandingAsset.secondaryColor) logChange('Secondary color', brandingAsset.secondaryColor, draft.secondaryColor);
    if (draft.accentColor !== brandingAsset.accentColor) logChange('Accent color', brandingAsset.accentColor, draft.accentColor);
    setBrandingAsset((a) => ({ ...a, ...draft }));
    setColorModalOpen(false);
    notify('Colors updated — live on your fan-facing app.');
  };

  const handleFontChange = (value) => {
    logChange('Font family', brandingAsset.fontFamily, value);
    setBrandingAsset((a) => ({ ...a, fontFamily: value }));
    notify('Font updated — live on your fan-facing app.');
  };

  const handleSizeScaleChange = (value) => {
    logChange('Size scale', brandingAsset.sizeScale, value);
    setBrandingAsset((a) => ({ ...a, sizeScale: value }));
    notify('Size scale updated — live on your fan-facing app.');
  };

  const handleSavePage = (draft) => {
    if (pagePanel.page) {
      setPages((list) => list.map((p) => (p.id === pagePanel.page.id ? { ...p, ...draft, lastUpdated: nowLabel().slice(0, 10) } : p)));
      logChange(`Page "${draft.name}"`, pagePanel.page.name, draft.name);
      notify('Page updated — live on your fan-facing app.');
    } else {
      const newPage = { id: uid(), name: draft.name, slug: draft.slug, status: 'draft', lastUpdated: nowLabel().slice(0, 10) };
      setPages((list) => [newPage, ...list]);
      logChange(`Page "${draft.name}"`, '', 'Created (draft)');
      notify('Page added.');
    }
    setPagePanel({ open: false, page: null });
  };

  const handleDeletePage = () => {
    setPages((list) => list.filter((p) => p.id !== deleteTarget.id));
    logChange(`Page "${deleteTarget.name}"`, 'Existed', 'Deleted');
    notify('Page deleted.');
    setDeleteTarget(null);
  };

  const handleSaveRedirect = (link, value) => {
    logChange(link.label, link.targetUrl, value);
    setRedirectLinks((list) => list.map((r) => (r.id === link.id ? { ...r, targetUrl: value } : r)));
    notify('Redirect link updated — live on your fan-facing app.');
  };

  const handleSaveTranslation = (key, lang, value) => {
    const entry = translations.find((t) => t.key === key);
    logChange(`Translation "${key}" (${lang.toUpperCase()})`, entry?.[lang] || '', value);
    setTranslations((list) => list.map((t) => (t.key === key ? { ...t, [lang]: value } : t)));
    notify('Translation updated — live on your fan-facing app.');
  };

  return (
    <div style={{ minHeight: '100%', background: DS.bgPage }}>
      <StatePreview
        groups={[{ label: 'State', value: demoState, onChange: setDemoState, options: ['ready', 'loading', 'empty', 'error'] }]}
      />

      <div style={{ padding: '16px 24px 0' }}>
        <NavLink
          to="/sso-admin"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none', color: DS.textSecondary, ...TY.b2, fontFamily: DS.ff }}
        >
          <Ico.ArrowLeftSmall s={14} c={DS.textSecondary} /> Back to Admin Hub
        </NavLink>
      </div>

      <PageHeader
        icon={<Ico.Paint s={20} c={DS.actionPrimary} />}
        title="Branding & Content"
        description="Update your logo, colors, fonts, pages, redirects, texts and translations — changes go live immediately."
        actions={
          <Btn type="Secondary" iconLeft={<Ico.Eye s={16} />} onClick={() => window.open('https://ubb.fr/mon-compte', '_blank', 'noopener,noreferrer')}>
            Preview live
          </Btn>
        }
      />

      {demoState === 'error' ? (
        <div style={{ padding: '80px 40px' }}>
          <ErrorState
            title="Couldn't load branding & content."
            sub="Something went wrong loading this page."
            onRetry={() => setDemoState('ready')}
          />
        </div>
      ) : (
        <>
          <TabBar active={activeTab} onChange={setActiveTab} />

          {demoState === 'loading' ? (
            <BrandingSkeleton />
          ) : activeTab === 'branding' ? (
            <BrandingTab
              asset={brandingAsset}
              onUploadLogo={handleUploadLogo}
              onEditColors={() => setColorModalOpen(true)}
              onFontChange={handleFontChange}
              onSizeScaleChange={handleSizeScaleChange}
            />
          ) : (
            <ContentTab
              pages={pages}
              redirectLinks={redirectLinks}
              translations={translations}
              language={language}
              onLanguageChange={setLanguage}
              onAddPage={() => setPagePanel({ open: true, page: null })}
              onEditPage={(p) => setPagePanel({ open: true, page: p })}
              onDeletePage={setDeleteTarget}
              onSaveRedirect={handleSaveRedirect}
              onSaveTranslation={handleSaveTranslation}
            />
          )}

          {demoState !== 'loading' && <AuditLog entries={auditLog} />}
        </>
      )}

      <ColorEditModal open={colorModalOpen} colors={brandingAsset} onClose={() => setColorModalOpen(false)} onSave={handleSaveColors} />

      <PagePanel
        open={pagePanel.open}
        initial={pagePanel.page}
        onClose={() => setPagePanel({ open: false, page: null })}
        onSave={handleSavePage}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this page?"
        body={deleteTarget ? `"${deleteTarget.name}" will be removed from your My Account space. This can't be undone.` : ''}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        danger
        onConfirm={handleDeletePage}
        onCancel={() => setDeleteTarget(null)}
      />

      <Toast toast={toast} />
    </div>
  );
}
