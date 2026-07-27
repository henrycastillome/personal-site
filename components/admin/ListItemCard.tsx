'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Card, Flex, IconButton, Text } from '@chakra-ui/react';
import { LuChevronDown, LuChevronUp, LuTrash2, LuEye, LuEyeOff } from 'react-icons/lu';
import type { ActionResult } from '@/app/admin/actions';

/** Titles are stored as HTML - strip tags for the collapsed row label. */
export function stripHtml(html?: string | null): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

interface ListItemCardProps {
  title: string;
  subtitle?: string;
  visible?: boolean;
  defaultOpen?: boolean;
  onMove?: (direction: 'up' | 'down') => Promise<ActionResult>;
  onDelete?: () => Promise<ActionResult>;
  deleteConfirm?: string;
  children: React.ReactNode;
}

/**
 * Collapsible row for the Projects and Background lists: header with reorder,
 * delete and a visibility marker; the edit form lives in `children`.
 */
export function ListItemCard({
  title,
  subtitle,
  visible = true,
  defaultOpen = false,
  onMove,
  onDelete,
  deleteConfirm = 'Delete this entry? This cannot be undone.',
  children,
}: ListItemCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const run = (action: () => Promise<ActionResult>) => {
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error ?? 'Something went wrong.');
        return;
      }
      setError(null);
      router.refresh();
    });
  };

  return (
    <Card.Root variant="outline" opacity={pending ? 0.6 : 1}>
      <Flex align="center" gap="2" px="4" py="3">
        <Flex
          asChild
          flex="1"
          minW="0"
          align="center"
          gap="2"
          textAlign="left"
          cursor="pointer"
        >
          <button type="button" onClick={() => setOpen(!open)}>
            {open ? <LuChevronUp size={16} /> : <LuChevronDown size={16} />}
            <Box minW="0">
              <Text textStyle="captionBold" color="text.primary" truncate>
                {title || 'Untitled'}
              </Text>
              {subtitle && (
                <Text textStyle="caption" color="text.tertiary" truncate>
                  {subtitle}
                </Text>
              )}
            </Box>
          </button>
        </Flex>

        <Box
          title={visible ? 'Visible on the site' : 'Hidden from the site'}
          color={visible ? 'accent.brand' : 'text.tertiary'}
          display="flex"
        >
          {visible ? <LuEye size={15} /> : <LuEyeOff size={15} />}
        </Box>

        {onMove && (
          <>
            <IconAction label="Move up" onClick={() => run(() => onMove('up'))}>
              <LuChevronUp size={15} />
            </IconAction>
            <IconAction label="Move down" onClick={() => run(() => onMove('down'))}>
              <LuChevronDown size={15} />
            </IconAction>
          </>
        )}

        {onDelete && (
          <IconAction
            label="Delete"
            danger
            onClick={() => {
              if (window.confirm(deleteConfirm)) run(onDelete);
            }}
          >
            <LuTrash2 size={15} />
          </IconAction>
        )}
      </Flex>

      {error && (
        <Text textStyle="caption" color="status.error" px="4" pb="2">
          {error}
        </Text>
      )}

      {open && (
        <Box
          px="4"
          py="5"
          borderTopWidth="1px"
          borderColor="border.default"
          bg="bg.primary"
        >
          {children}
        </Box>
      )}
    </Card.Root>
  );
}

function IconAction({
  label,
  danger,
  onClick,
  children,
}: {
  label: string;
  danger?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <IconButton
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      size="sm"
      variant="ghost"
      colorPalette={danger ? 'red' : 'brand'}
      color={danger ? 'status.error' : 'text.secondary'}
    >
      {children}
    </IconButton>
  );
}
