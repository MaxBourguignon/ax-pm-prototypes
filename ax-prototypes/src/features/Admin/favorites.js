/**
 * Admin favourites — the tools a CS user pins to the admin sidebar, so the
 * menu holds what they actually use instead of every back-office page.
 *
 * One tiny store shared by the console home (star toggles) and the sidebar
 * (the pinned list), read with useSyncExternalStore so both update together.
 * Kept in localStorage as a per-viewer convenience; a private window or
 * blocked storage just falls back to the defaults.
 */
import { useSyncExternalStore } from 'react';

const KEY = 'ax-admin-favorites';
const DEFAULTS = ['entity-merge', 'roles'];

function load() {
  try {
    const v = JSON.parse(window.localStorage.getItem(KEY));
    if (Array.isArray(v)) return v;
  } catch { /* no storage — defaults */ }
  return DEFAULTS;
}

let favorites = load();
const listeners = new Set();

export function toggleFavorite(id) {
  favorites = favorites.includes(id) ? favorites.filter((x) => x !== id) : [...favorites, id];
  try { window.localStorage.setItem(KEY, JSON.stringify(favorites)); } catch { /* ignore */ }
  listeners.forEach((l) => l());
}

const subscribe = (l) => { listeners.add(l); return () => listeners.delete(l); };
const snapshot = () => favorites;

export function useFavorites() {
  return useSyncExternalStore(subscribe, snapshot);
}
