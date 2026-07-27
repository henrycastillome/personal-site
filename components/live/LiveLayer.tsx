'use client';

import { useLivePresence } from '@/lib/presence/useLivePresence';
import { LiveCursors } from './LiveCursors';
import { PresenceBar } from './PresenceBar';

/**
 * Drops the multiplayer layer onto a template: joins the room, renders the
 * children, then overlays everyone else's cursors and the presence stack.
 */
export function LiveLayer({
  room,
  children,
}: {
  room: string;
  children: React.ReactNode;
}) {
  const { others, cursors, selfPos, me, setName } = useLivePresence(room);

  return (
    <>
      {children}
      <LiveCursors cursors={cursors} me={me} selfPos={selfPos} />
      <PresenceBar others={others} me={me} setName={setName} />
    </>
  );
}
