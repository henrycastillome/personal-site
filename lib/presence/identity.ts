import { getVisitorId } from '@/lib/analytics/track';
import type { GeoLocation } from '@/lib/analytics/geo';

/**
 * Anonymous live identity for the multiplayer templates.
 *
 * A visitor gets a stable colour from their analytics visitor id, plus a name.
 * The name is city-based ("Someone from Brooklyn") once we know their coarse
 * location; until then (and when location is unknown) it is a neutral fallback.
 * A manual rename always wins and is remembered for the session.
 */

const COLORS = [
  '#0d9488', '#6366f1', '#ec4899', '#f59e0b',
  '#10b981', '#3b82f6', '#ef4444', '#8b5cf6',
];

/** Light phrasing variety so two people from the same city are not identical. */
const PREFIXES = ['Someone from', 'A visitor from', 'Guest from', 'Someone in'];

const FALLBACK_NAME = 'A curious guest';
// v2: bumped so any stale name from an earlier build/session is ignored.
const NAME_KEY = 'henry_live_name_v2';

export interface Identity {
  id: string;
  name: string;
  color: string;
}

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Client-only: reads localStorage (visitor id) and sessionStorage (rename). */
export function getIdentity(): Identity {
  const id = getVisitorId();
  const color = COLORS[hash(id) % COLORS.length];

  let name = FALLBACK_NAME;
  try {
    name = sessionStorage.getItem(NAME_KEY) || FALLBACK_NAME;
  } catch {
    // storage blocked — fall back to the neutral name
  }
  return { id, name, color };
}

/** Whether the visitor has manually renamed themselves this session. */
export function hasManualName(): boolean {
  try {
    return Boolean(sessionStorage.getItem(NAME_KEY));
  } catch {
    return false;
  }
}

/** Builds a city-based name from coarse geo, or the fallback when unknown. */
export function locationName(geo: GeoLocation | null, id: string): string {
  const place = geo?.city ?? geo?.region ?? geo?.country;
  if (!place) return FALLBACK_NAME;
  const prefix = PREFIXES[hash(id) % PREFIXES.length];
  return `${prefix} ${place}`;
}

export function setStoredName(name: string): void {
  try {
    sessionStorage.setItem(NAME_KEY, name);
  } catch {
    // ignore
  }
}

export function initials(name: string): string {
  const trimmed = name.trim();
  // City-based names ("Someone from Brooklyn", "Guest from New York", "Someone
  // in Paris") should read as the place, not the prefix — so "BR", "NY", "PA".
  const place = trimmed.match(/\b(?:from|in)\s+(.+)$/i);
  const basis = place ? place[1] : trimmed;
  const parts = basis.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
