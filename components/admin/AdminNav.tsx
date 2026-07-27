'use client';

import NextLink, { useLinkStatus } from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar, Box, Button, Flex, Separator, Spinner, Text, VStack } from '@chakra-ui/react';
import { ADMIN_SECTIONS } from '@/components/admin/sections';
import { SignOutButton } from '@/components/admin/SignOutButton';
import type { AdminSection } from '@/components/admin/sections';

/**
 * The clicked item's own icon becomes a spinner while its page loads, so the
 * feedback lands where the click did rather than only in the content area.
 *
 * useLinkStatus only reports for the Link it is rendered inside, which is why
 * this is a child component rather than state held in AdminNav.
 */
function NavItemBody({ icon: Icon, label }: { icon: AdminSection['icon']; label: string }) {
  const { pending } = useLinkStatus();

  return (
    <>
      {/* Matched to the icon's box so swapping them does not shift the label. */}
      {pending ? (
        <Spinner boxSize="17px" borderWidth="2px" data-testid="admin-nav-pending" />
      ) : (
        <Icon size={17} aria-hidden />
      )}
      {label}
    </>
  );
}

export function AdminNav({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <Flex
      direction="column"
      w={{ base: 'full', lg: '280px' }}
      flexShrink={0}
      // Without a height cap the sidebar stretches to the full document height,
      // which pushes sign-out far below the fold on long editor pages.
      position={{ base: 'static', lg: 'sticky' }}
      top={{ lg: '0' }}
      // Opt out of the row's align-items:stretch so the 100vh height applies.
      alignSelf={{ lg: 'flex-start' }}
      h={{ lg: '100vh' }}
      overflowY={{ lg: 'auto' }}
      bg="bg.surface"
      borderRightWidth={{ base: '0', lg: '1px' }}
      borderBottomWidth={{ base: '1px', lg: '0' }}
      borderColor="border.default"
    >
      {/* Identity block - mirrors the public sidebar's avatar + name. */}
      <Flex align="center" gap="3" px="6" py="6">
        <Avatar.Root size="sm" shape="full" colorPalette="brand" flexShrink={0}>
          <Avatar.Fallback name={email || 'Admin'} />
        </Avatar.Root>
        <Box minW="0">
          <NextLink href="/admin">
            <Text textStyle="bodyBold" color="text.primary">
              Site editor
            </Text>
          </NextLink>
          <Text textStyle="caption" color="text.secondary" truncate>
            {email}
          </Text>
        </Box>
      </Flex>

      <Separator borderColor="border.default" />

      <VStack as="nav" align="stretch" gap="0" flex="1" py="2">
        {ADMIN_SECTIONS.map((section) => {
          const active = pathname === section.href;
          return (
            <Button
              key={section.href}
              asChild
              variant={active ? 'subtle' : 'ghost'}
              colorPalette="brand"
              justifyContent="flex-start"
              gap="3"
              px="6"
              py="5"
              borderRadius="none"
              borderLeftWidth="3px"
              borderLeftColor={active ? 'accent.brand' : 'transparent'}
              color={active ? 'accent.brand' : 'text.secondary'}
              fontWeight={active ? 'semibold' : 'normal'}
              textStyle="appUI"
            >
              <NextLink
                data-testid={`admin-nav-${section.label.toLowerCase().replace(/\s+/g, "-")}`}
                href={section.href}
                aria-current={active ? 'page' : undefined}
              >
                <NavItemBody icon={section.icon} label={section.label} />
              </NextLink>
            </Button>
          );
        })}
      </VStack>

      <Separator borderColor="border.default" />

      <VStack align="stretch" gap="3" px="6" py="5">
        <NextLink href="/" target="_blank">
          <Text textStyle="captionBold" color="accent.brand" px="3">
            View live site
          </Text>
        </NextLink>

        <SignOutButton />
      </VStack>
    </Flex>
  );
}
