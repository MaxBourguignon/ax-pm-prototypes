/**
 * AX Design System — Carousel / CarouselDots
 *
 * Figma Molecules/CarouselDots (1973:6506), shown in use on 1987:305:
 *   https://www.figma.com/design/nIMtO7v8dDamI8b2vnMcRc/Arenametrix-DS--WIP-?node-id=1987-305
 *
 * Geometry read from the component's own vector, not estimated:
 *   36 × 8 for three dots · each dot 8 × 8 (r 4) · centres at x 4 / 18 / 32,
 *   so a 6px gap · active fill brand/primary #2575FC · inactive surface/muted
 *   #DEE0E3.
 *
 * ⚠ What the DS does NOT specify, and is therefore local:
 *   - The DS ships the dots ONLY. There is no carousel frame, no arrows, no
 *     slide transition and no auto-play anywhere in the file, so `Carousel`
 *     below is a codebase wrapper: it owns the page state and renders the DS
 *     dots under the active page. Nothing animates — the page simply swaps.
 *   - The dots have no interactive states (no hover, no focus, no disabled).
 *     They are clickable here because an indicator nobody can use is not worth
 *     shipping; hover lifts an inactive dot to border/strong, nothing moves.
 *   - Three dots is the mock content, not a fixed count — `count` follows the
 *     pages it is given.
 *
 * Usage
 *   <Carousel pages={[<MetricsRow/>, <MoreMetrics/>]} />
 *   <CarouselDots count={3} index={1} onSelect={setIndex} />   // dots alone
 */
import React from 'react';
import { DS } from '../utils/designSystem';

const DOT = 8;
const GAP = 6;

export function CarouselDots({ count = 0, index = 0, onSelect, label = 'page' }) {
  if (count <= 1) return null;
  return (
    <div
      role="tablist"
      style={{ display: 'inline-flex', alignItems: 'center', gap: GAP, height: DOT }}
    >
      {Array.from({ length: count }, (_, i) => {
        const active = i === index;
        return (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={`Go to ${label} ${i + 1}`}
            onClick={onSelect ? () => onSelect(i) : undefined}
            onMouseEnter={(e) => {
              if (!active) e.currentTarget.style.background = DS.borderStrong;
            }}
            onMouseLeave={(e) => {
              if (!active) e.currentTarget.style.background = DS.surfaceMuted;
            }}
            style={{
              width: DOT, height: DOT, padding: 0, flexShrink: 0,
              borderRadius: DS.radiusPill, border: 'none',
              background: active ? DS.brandPrimary : DS.surfaceMuted,
              cursor: onSelect ? 'pointer' : 'default',
              transition: `background ${DS.durFast} ${DS.ease}`,
            }}
          />
        );
      })}
    </div>
  );
}

/**
 * Pages a list of nodes, with the DS dots centred beneath.
 * Controlled via `index` + `onIndexChange`, or left to manage its own state.
 */
export function Carousel({ pages = [], index, onIndexChange, gap = 16, label = 'page' }) {
  const [own, setOwn] = React.useState(0);
  const controlled = index != null;
  const current = Math.min(controlled ? index : own, Math.max(0, pages.length - 1));
  const select = (i) => (controlled ? onIndexChange && onIndexChange(i) : setOwn(i));

  if (pages.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap }}>
      <div>{pages[current]}</div>
      {pages.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <CarouselDots count={pages.length} index={current} onSelect={select} label={label} />
        </div>
      )}
    </div>
  );
}

export default Carousel;
