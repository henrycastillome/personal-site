'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import {
  getIdentity,
  setStoredName,
  hasManualName,
  locationName,
  type Identity,
} from '@/lib/presence/identity';
import type { GeoLocation } from '@/lib/analytics/geo';

const GEO_CACHE_KEY = 'henry_live_geo';

export interface Member {
  id: string;
  name: string;
  color: string;
}

export interface Cursor {
  id: string;
  name: string;
  color: string;
  x: number; // viewport fraction 0..1
  y: number; // viewport fraction 0..1
  t: number; // last-seen timestamp (ms)
}

interface TrackMeta {
  name: string;
  color: string;
}

const STALE_MS = 10_000;

/**
 * Joins a Supabase Realtime room and returns who is present plus everyone
 * else's live cursor. Presence powers the avatar stack; broadcast carries
 * cursor positions (throttled to one send per animation frame). Ephemeral —
 * nothing is written to the database.
 */
export function useLivePresence(room: string) {
  const [others, setOthers] = useState<Member[]>([]);
  const [cursors, setCursors] = useState<Record<string, Cursor>>({});
  const [selfPos, setSelfPos] = useState<{ x: number; y: number } | null>(null);
  const [me, setMe] = useState<Identity | null>(null);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const meRef = useRef<Identity | null>(null);

  useEffect(() => {
    const identity = getIdentity();
    meRef.current = identity;
    setMe(identity);

    const supabase = createClient();
    // `v2` isolates current clients from any stale connection lingering on the
    // old channel (an old browser tab can't be evicted server-side; a fresh
    // channel simply leaves it behind).
    const channel = supabase.channel(`henry-live-v2-${room}`, {
      config: { presence: { key: identity.id } },
    });
    channelRef.current = channel;

    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState<TrackMeta>();
      const members: Member[] = Object.keys(state).map((id) => {
        const meta = state[id][0];
        return { id, name: meta?.name ?? 'Anon', color: meta?.color ?? '#888888' };
      });
      setOthers(members);
    });

    channel.on('presence', { event: 'leave' }, ({ key }: { key: string }) => {
      setCursors((prev) => {
        if (!(key in prev)) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      });
    });

    channel.on('broadcast', { event: 'cursor' }, ({ payload }) => {
      const c = payload as Omit<Cursor, 't'>;
      if (c.id === identity.id) return;
      setCursors((prev) => ({ ...prev, [c.id]: { ...c, t: Date.now() } }));
    });

    let subscribed = false;
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        subscribed = true;
        void channel.track({ name: meRef.current?.name ?? identity.name, color: identity.color });
      }
    });

    // Resolve a city-based name ("Someone from Brooklyn") unless the visitor has
    // manually renamed themselves. Cached per session; falls back silently.
    const applyName = (name: string) => {
      if (hasManualName() || name === meRef.current?.name) return;
      const updated: Identity = { ...(meRef.current ?? identity), name };
      meRef.current = updated;
      setMe(updated);
      if (subscribed) void channel.track({ name, color: updated.color });
    };
    if (!hasManualName()) {
      const cached = (() => {
        try {
          const raw = sessionStorage.getItem(GEO_CACHE_KEY);
          return raw ? (JSON.parse(raw) as GeoLocation) : null;
        } catch {
          return null;
        }
      })();
      if (cached) {
        applyName(locationName(cached, identity.id));
      } else {
        void fetch('/api/geo')
          .then((r) => (r.ok ? r.json() : null))
          .then((geo: GeoLocation | null) => {
            if (!geo) return;
            try {
              sessionStorage.setItem(GEO_CACHE_KEY, JSON.stringify(geo));
            } catch {
              // ignore
            }
            applyName(locationName(geo, identity.id));
          })
          .catch(() => {
            // network/geo failure — keep the fallback name
          });
      }
    }

    // Cursor broadcast — coalesced to one send per frame.
    let raf = 0;
    let pending: { x: number; y: number } | null = null;
    const flush = () => {
      raf = 0;
      if (!pending) return;
      setSelfPos(pending);
      void channel.send({
        type: 'broadcast',
        event: 'cursor',
        payload: {
          id: identity.id,
          name: meRef.current?.name ?? identity.name,
          color: identity.color,
          x: pending.x,
          y: pending.y,
        },
      });
      pending = null;
    };
    const onMove = (e: MouseEvent) => {
      pending = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight };
      if (!raf) raf = requestAnimationFrame(flush);
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    // Drop cursors from tabs that went idle without a proper leave.
    const prune = window.setInterval(() => {
      setCursors((prev) => {
        const now = Date.now();
        let changed = false;
        const next: Record<string, Cursor> = {};
        for (const key of Object.keys(prev)) {
          if (now - prev[key].t < STALE_MS) next[key] = prev[key];
          else changed = true;
        }
        return changed ? next : prev;
      });
    }, 5000);

    return () => {
      window.removeEventListener('mousemove', onMove);
      if (raf) cancelAnimationFrame(raf);
      window.clearInterval(prune);
      void channel.untrack();
      void supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [room]);

  const setName = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed || !meRef.current) return;
    setStoredName(trimmed);
    const updated: Identity = { ...meRef.current, name: trimmed };
    meRef.current = updated;
    setMe(updated);
    void channelRef.current?.track({ name: trimmed, color: updated.color });
  }, []);

  return { others, cursors, selfPos, me, setName };
}
