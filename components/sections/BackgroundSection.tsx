'use client';

import { useState } from 'react';
import { Box, Text, Flex, Button, Icon } from '@chakra-ui/react';
import { LuBriefcase, LuGraduationCap, LuPlus, LuChevronUp } from 'react-icons/lu';
import { RichText } from '@/components/ui/RichText';
import type { WorkHistory } from '@/lib/types';

interface BackgroundSectionProps {
  workHistory: WorkHistory[];
  /** Rich-text section heading from the CMS; falls back when unset. */
  heading?: string;
}

/** How many entries show before the "Show more" button. */
const LIMIT = 3;

/** Work rows (the default) get a briefcase; education rows get a graduation cap. */
function markerIcon(entryType?: string) {
  return entryType === 'education' ? LuGraduationCap : LuBriefcase;
}

/** Year-only range, e.g. '2023 – 2025' or '2025 – Present'. Parsed from the ISO string. */
function yearRange(item: WorkHistory): string {
  const start = item.start_date?.split('-')[0] ?? '';
  const end = item.is_current ? 'Present' : item.end_date?.split('-')[0] ?? 'Present';
  return start === end ? start : `${start} – ${end}`;
}

export function BackgroundSection({ workHistory, heading }: BackgroundSectionProps) {
  const [expanded, setExpanded] = useState(false);

  const visibleHistory = workHistory
    .filter((item) => item.is_visible)
    .sort((a, b) => a.order_index - b.order_index);

  if (visibleHistory.length === 0) return null;

  const hasMore = visibleHistory.length > LIMIT;
  const shown = expanded ? visibleHistory : visibleHistory.slice(0, LIMIT);

  return (
    <Box>
      {/* Section Title */}
      <RichText
        as="h2"
        html={heading || 'Background'}
        spacing="tight"
        textStyle="h2"
        color="text.primary"
        pb={{ base: '10', md: '16' }}
      />

      {/* Timeline */}
      <Box position="relative" maxW="880px" mx="auto">
        {/* The spine: left rail on mobile, centered on desktop */}
        <Box
          aria-hidden
          position="absolute"
          top="0"
          bottom="0"
          left={{ base: '18px', md: '50%' }}
          transform={{ md: 'translateX(-50%)' }}
          w="2px"
          bg="border.default"
        />

        {shown.map((item, idx) => {
          const leftSide = idx % 2 === 0;
          const NodeIcon = markerIcon(item.entry_type);
          return (
            <Box
              key={item.id}
              position="relative"
              pb={{ base: '10', md: '14' }}
              _last={{ pb: '0' }}
            >
              {/* Node marker — briefcase (work) or cap (education) */}
              <Flex
                position="absolute"
                top="0"
                left={{ base: '18px', md: '50%' }}
                transform="translateX(-50%)"
                align="center"
                justify="center"
                w="34px"
                h="34px"
                borderRadius="full"
                bg="accent.brand"
                color="text.inverse"
                borderWidth="3px"
                borderColor="bg.primary"
                zIndex="1"
                flexShrink={0}
              >
                <Icon as={NodeIcon} boxSize="16px" />
              </Flex>

              {/* Entry — alternates left/right on desktop, stacks on mobile */}
              <Box
                w={{ base: 'full', md: '50%' }}
                pl={{ base: '16', md: leftSide ? '0' : '12' }}
                pr={{ base: '0', md: leftSide ? '12' : '0' }}
                ml={{ md: leftSide ? '0' : 'auto' }}
                textAlign={{ base: 'left', md: leftSide ? 'right' : 'left' }}
                pt="1"
              >
                <Text
                  textStyle="caption"
                  fontWeight="semibold"
                  color="accent.brand"
                  textTransform="uppercase"
                  letterSpacing="wide"
                >
                  {yearRange(item)}
                </Text>

                <RichText
                  html={item.position}
                  spacing="tight"
                  textStyle="h3"
                  color="text.primary"
                  mt="1"
                />

                {item.company && (
                  <Text textStyle="body" color="text.secondary" mt="1">
                    {item.company}
                  </Text>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Progressive disclosure */}
      {hasMore && (
        <Flex justify="center" mt={{ base: '8', md: '10' }}>
          <Button
            variant="outline"
            colorPalette="brand"
            borderRadius="full"
            size="sm"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? (
              <>
                <LuChevronUp /> Show less
              </>
            ) : (
              <>
                <LuPlus /> Show more ({visibleHistory.length - LIMIT})
              </>
            )}
          </Button>
        </Flex>
      )}
    </Box>
  );
}
