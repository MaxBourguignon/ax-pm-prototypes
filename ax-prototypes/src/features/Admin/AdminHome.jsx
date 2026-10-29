/**
 * AX Prototypes — Admin console home (CS back-office)
 *
 * The landing page of the admin side: a search, the user's favourites, then
 * every tool as a tile, grouped under a hairline section heading. One brand
 * hue only — DS container shell (borderSection, radius 12, shadowSm), bgIcons
 * tile with a brand icon, name over a two-line description, and a footer that
 * states the tool's status and the "Open" action.
 *
 * The star on each row pins the tool to the admin sidebar (see ./favorites),
 * which lists only the console and the favourites instead of every tool.
 *
 * Only Entity merge has a page — it opens it; the others say "coming soon" in a
 * toast. Translation manager is unavailable: greyed, and cannot be pinned.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DS, TY } from '../../utils/designSystem';
import Ico from '../../utils/icons';
import PageHeader from '../../components/PageHeader';
import { SearchField } from '../../components/Field';
import Toast from '../../components/Toast';
import { EmptyState } from '../../components/Feedback';
import { ADMIN_GROUPS } from './adminTools';
import { useFavorites, toggleFavorite } from './favorites';

const ALL_TOOLS = ADMIN_GROUPS.flatMap((g) => g.tools);

/* Section heading: label, count, and a hairline running to the edge so each
   group reads as a band without needing a box around it. */
const SectionHeading = ({ children, count }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <span style={{ ...TY.bodyMdBold, color: DS.textStrong, fontFamily: DS.ff, whiteSpace: 'nowrap' }}>{children}</span>
    {count != null && (
      <span style={{
        ...TY.labelMd, color: DS.textSecondary, background: DS.surfaceCanvas,
        border: `1px solid ${DS.borderSection}`, borderRadius: 999, padding: '0 8px', fontFamily: DS.ff,
      }}>
        {count}
      </span>
    )}
    <span style={{ flex: 1, height: 1, background: DS.borderSection }} />
  </div>
);

function StarButton({ on, onToggle, name, visible }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      title={on ? 'Remove from favorites' : 'Add to favorites'}
      aria-label={on ? `Remove ${name} from favorites` : `Add ${name} to favorites`}
      aria-pressed={on}
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 32, height: 32, borderRadius: DS.radiusLg, border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        background: hover ? DS.surfaceSubtle : 'transparent',
        // An unpinned star only shows on card hover — a pinned one always does.
        opacity: on || visible || hover ? 1 : 0,
        transition: `opacity ${DS.durFast} ${DS.ease}, background ${DS.durFast} ${DS.ease}`,
      }}
    >
      <Ico.Star s={18} filled={on} c={on ? DS.brandYellowInk : DS.textSecondary} />
    </button>
  );
}

/* One tool as a tile: brand icon tile, name, two-line description, and a
   footer that says what happens on click. Hover: brand border, a lift, the
   icon tile fills, the footer arrow turns brand. Single brand hue only. */
function ToolTile({ tool, favorite, onOpen }) {
  const [hover, setHover] = useState(false);
  const { Icon, unavailable } = tool;
  const lit = hover && !unavailable;
  return (
    <div
      role="button"
      tabIndex={unavailable ? -1 : 0}
      aria-disabled={unavailable || undefined}
      onClick={unavailable ? undefined : () => onOpen(tool)}
      onKeyDown={(e) => { if (!unavailable && e.key === 'Enter') onOpen(tool); }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', flexDirection: 'column', gap: 12, padding: 16, boxSizing: 'border-box',
        background: unavailable ? DS.surfaceSubtle : DS.surfaceCanvas,
        border: `1px solid ${lit ? DS.brandPrimary : DS.borderSection}`,
        borderRadius: DS.radiusXl,
        boxShadow: lit ? '0 8px 24px rgba(37,117,252,0.12)' : DS.shadowSm,
        transform: lit ? 'translateY(-2px)' : 'none',
        cursor: unavailable ? 'not-allowed' : 'pointer',
        transition: `border-color ${DS.durFast} ${DS.ease}, box-shadow ${DS.durBase} ${DS.ease}, transform ${DS.durBase} ${DS.ease}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <span style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: unavailable ? DS.surfaceCanvas : lit ? DS.brandPrimary : DS.bgIcons,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: `background ${DS.durFast} ${DS.ease}`,
        }}>
          <Icon s={20} c={unavailable ? DS.textMuted : lit ? DS.white : DS.actionPrimary} />
        </span>
        {!unavailable && <StarButton on={favorite} visible={hover} name={tool.name} onToggle={() => toggleFavorite(tool.id)} />}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 0 }}>
        <span style={{ ...TY.bodyMdBold, fontSize: 15, color: unavailable ? DS.textSecondary : DS.textStrong, fontFamily: DS.ff }}>{tool.name}</span>
        <span style={{
          ...TY.bodySm, color: DS.textSecondary, fontFamily: DS.ff,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 36,
        }}>
          {tool.desc}
        </span>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
        paddingTop: 12, borderTop: `1px solid ${DS.borderSection}`,
      }}>
        {/* Left slot only speaks for an unavailable tool; otherwise empty. */}
        <span style={{ ...TY.labelMd, color: DS.textMuted, fontFamily: DS.ff }}>{unavailable ? 'Unavailable' : ''}</span>
        {!unavailable && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, ...TY.labelMd, fontFamily: DS.ff, color: lit ? DS.brandPrimary : DS.textSecondary }}>
            Open
            <span style={{ display: 'flex', transform: lit ? 'translateX(2px)' : 'none', transition: `transform ${DS.durFast} ${DS.ease}` }}>
              <Ico.ArrowRightSmall s={16} c={lit ? DS.brandPrimary : DS.textSecondary} />
            </span>
          </span>
        )}
      </div>
    </div>
  );
}

const Grid = ({ children }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
    {children}
  </div>
);

export default function AdminHome() {
  const navigate = useNavigate();
  const favorites = useFavorites();
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState(null);
  const showToast = (m) => { setToast(m); setTimeout(() => setToast(null), 2600); };

  const q = query.trim().toLowerCase();
  const match = (t) => !q || `${t.name} ${t.desc}`.toLowerCase().includes(q);
  const groups = ADMIN_GROUPS
    .map((g) => ({ ...g, tools: g.tools.filter(match) }))
    .filter((g) => g.tools.length);
  const favTools = favorites.map((id) => ALL_TOOLS.find((t) => t.id === id)).filter((t) => t && match(t));

  const open = (tool) => (tool.link ? navigate(tool.link) : showToast(`${tool.name} — coming soon.`));
  const tiles = (tools) => tools.map((t) => (
    <ToolTile key={t.id} tool={t} favorite={favorites.includes(t.id)} onOpen={open} />
  ));

  return (
    <div style={{ minHeight: '100%', paddingBottom: 48, fontFamily: DS.ff }}>
      <PageHeader
        icon={<Ico.Settings s={20} c={DS.actionPrimary} />}
        title="Admin console"
        description="Back-office tools for the CS team. Changes made here apply to the client’s tenant."
      />

      <div style={{ paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div style={{ width: 320, alignSelf: 'flex-end' }}>
          <SearchField value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search a tool…" />
        </div>

        {groups.length === 0 ? (
          <EmptyState icon={<Ico.Search s={24} />} title="No results" sub={`No tool matches “${query}”.`} />
        ) : (
          <>
            {/* Favourites first — the same list the sidebar pins. */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <SectionHeading count={favTools.length || null}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Ico.Star s={16} filled c={DS.brandYellowInk} />Favorites
                </span>
              </SectionHeading>
              {favTools.length ? <Grid>{tiles(favTools)}</Grid> : (
                <div style={{
                  padding: '12px 16px', borderRadius: DS.radiusXl, border: `1px dashed ${DS.borderDefault}`,
                  ...TY.bodySm, color: DS.textSecondary, display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <Ico.Star s={16} c={DS.textSecondary} />
                  {q ? 'No favorite matches your search.' : 'Star a tool to pin it here and in the sidebar.'}
                </div>
              )}
            </section>

            {groups.map((g) => (
              <section key={g.id} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <SectionHeading count={g.tools.length}>{g.label}</SectionHeading>
                <Grid>{tiles(g.tools)}</Grid>
              </section>
            ))}
          </>
        )}
      </div>

      <Toast toast={toast} />
    </div>
  );
}
