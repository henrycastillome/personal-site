'use client';

import { Box } from '@chakra-ui/react';
import type { Identity } from '@/lib/presence/identity';
import type { Cursor } from '@/lib/presence/useLivePresence';

/**
 * Full-viewport, click-through overlay that renders everyone's cursor.
 * Positions come in as viewport fractions so they map across window sizes.
 * Other people get a full pointer + name; you get a name tag that trails your
 * own OS cursor (so the effect is visible even when you're here alone).
 */
export function LiveCursors({
  cursors,
  me,
  selfPos,
}: {
  cursors: Record<string, Cursor>;
  me: Identity | null;
  selfPos: { x: number; y: number } | null;
}) {
  return (
    <Box position="fixed" inset="0" zIndex="9999" pointerEvents="none" overflow="hidden">
      {/* Other people */}
      {Object.values(cursors).map((c) => (
        <Box
          key={c.id}
          data-testid="live-cursor"
          position="absolute"
          left={`${c.x * 100}vw`}
          top={`${c.y * 100}vh`}
          transition="left 90ms linear, top 90ms linear"
          willChange="left, top"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ display: 'block' }}>
            <path
              d="M3 2 L3 15 L7 11.5 L9.5 17 L12 16 L9.5 10.5 L15 10.5 Z"
              fill={c.color}
              stroke="white"
              strokeWidth="1"
              strokeLinejoin="round"
            />
          </svg>
          <Box
            position="absolute"
            left="16px"
            top="16px"
            px="2"
            py="0.5"
            borderRadius="full"
            bg={c.color}
            color="white"
            fontSize="12px"
            fontWeight="600"
            whiteSpace="nowrap"
            lineHeight="1.4"
            boxShadow="0 1px 4px rgba(0,0,0,0.25)"
          >
            {c.name}
          </Box>
        </Box>
      ))}

      {/* You — a name tag trailing your own cursor (tracks instantly) */}
      {me && selfPos && (
        <Box
          position="absolute"
          left={`${selfPos.x * 100}vw`}
          top={`${selfPos.y * 100}vh`}
        >
          <Box
            data-testid="self-cursor"
            position="absolute"
            left="14px"
            top="16px"
            px="2"
            py="0.5"
            borderRadius="full"
            bg={me.color}
            color="white"
            fontSize="12px"
            fontWeight="600"
            whiteSpace="nowrap"
            lineHeight="1.4"
            boxShadow="0 1px 4px rgba(0,0,0,0.25)"
            opacity="0.92"
          >
            {me.name} <Box as="span" opacity="0.7">(you)</Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}
