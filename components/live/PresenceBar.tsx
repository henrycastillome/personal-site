'use client';

import { useState } from 'react';
import { Box, Flex, Input, Text } from '@chakra-ui/react';
import { initials, type Identity } from '@/lib/presence/identity';
import type { Member } from '@/lib/presence/useLivePresence';

const MAX_SHOWN = 5;

function Avatar({
  name,
  color,
  isMe,
  onClick,
}: {
  name: string;
  color: string;
  isMe?: boolean;
  onClick?: () => void;
}) {
  return (
    <Flex
      as={onClick ? 'button' : 'div'}
      onClick={onClick}
      align="center"
      justify="center"
      w="34px"
      h="34px"
      borderRadius="full"
      bg={color}
      color="white"
      fontSize="12px"
      fontWeight="700"
      ml="-8px"
      borderWidth="2px"
      borderColor={isMe ? 'white' : 'rgba(255,255,255,0.85)'}
      boxShadow={isMe ? `0 0 0 2px ${color}` : '0 1px 3px rgba(0,0,0,0.3)'}
      cursor={onClick ? 'pointer' : 'default'}
      title={isMe ? `${name} (you)` : name}
      flexShrink={0}
    >
      {initials(name)}
    </Flex>
  );
}

/**
 * Figma-style collaborator stack, fixed to the top-right. Shows everyone
 * present (self ringed); clicking your own avatar reveals a rename field.
 */
export function PresenceBar({
  others,
  me,
  setName,
}: {
  others: Member[];
  me: Identity | null;
  setName: (name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  // Self first, then the rest; cap the stack with a "+N".
  const self = me ? others.find((o) => o.id === me.id) : undefined;
  const rest = others.filter((o) => o.id !== me?.id);
  const ordered = [...(self ? [self] : []), ...rest];
  const shown = ordered.slice(0, MAX_SHOWN);
  const overflow = ordered.length - shown.length;

  const commit = () => {
    if (draft.trim()) setName(draft);
    setEditing(false);
  };

  return (
    <Box position="fixed" top="12px" right="16px" zIndex="9998">
      <Flex align="center" gap="2">
        {editing ? (
          <Flex
            align="center"
            gap="2"
            bg="white"
            borderRadius="full"
            boxShadow="0 2px 10px rgba(0,0,0,0.2)"
            pl="3"
            pr="1"
            py="1"
          >
            <Input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commit();
                if (e.key === 'Escape') setEditing(false);
              }}
              onBlur={commit}
              placeholder="Your name"
              size="sm"
              variant="flushed"
              maxLength={24}
              width="130px"
              color="#111"
            />
          </Flex>
        ) : (
          <Flex
            align="center"
            bg="rgba(0,0,0,0.35)"
            borderRadius="full"
            px="2"
            py="1"
            pl="3"
            backdropFilter="blur(6px)"
          >
            <Text data-testid="presence-count" color="white" fontSize="12px" fontWeight="600" mr="2" whiteSpace="nowrap">
              {ordered.length} here
            </Text>
            <Flex align="center" pl="8px">
              {shown.map((m) => (
                <Avatar
                  key={m.id}
                  name={m.name}
                  color={m.color}
                  isMe={m.id === me?.id}
                  onClick={
                    m.id === me?.id
                      ? () => {
                          setDraft(m.name);
                          setEditing(true);
                        }
                      : undefined
                  }
                />
              ))}
              {overflow > 0 && (
                <Flex
                  align="center"
                  justify="center"
                  w="34px"
                  h="34px"
                  borderRadius="full"
                  bg="#4b5563"
                  color="white"
                  fontSize="12px"
                  fontWeight="700"
                  ml="-8px"
                  borderWidth="2px"
                  borderColor="rgba(255,255,255,0.85)"
                  flexShrink={0}
                >
                  +{overflow}
                </Flex>
              )}
            </Flex>
          </Flex>
        )}
      </Flex>
    </Box>
  );
}
