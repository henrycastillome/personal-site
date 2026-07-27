'use client';

import { useState, useEffect } from 'react';
import {
  Avatar,
  Box,
  Button,
  CloseButton,
  Drawer,
  Flex,
  IconButton,
  Portal,
  Text,
} from '@chakra-ui/react';
import { LuMenu, LuMail, LuGithub, LuLinkedin } from 'react-icons/lu';
import type { IconType } from 'react-icons';
import { trackClick } from '@/lib/analytics/track';

interface Section {
  id: string;
  label: string;
}

const sections: Section[] = [
  { id: 'home', label: 'Home' },
  { id: 'projects', label: 'Projects' },
  { id: 'career', label: 'Background' },
  { id: 'aboutme', label: 'About' },
  { id: 'contact', label: 'Contact' },
];

/** Shown under the name in the sidebar identity card. */
const ROLE = 'Senior UX Designer | M.S HCI & UX';

/** Mobile top-bar height. Kept in step with PageSection's scrollMarginTop. */
export const NAV_HEIGHT = '64px';

/** Desktop left-rail width. */
export const RAIL_WIDTH = '288px';

interface SiteNavProps {
  profileImage?: string;
  contactEmail?: string;
  linkedinUrl?: string;
  githubUrl?: string;
}

interface Social {
  key: string;
  href: string;
  label: string;
  Icon: IconType;
  external?: boolean;
  onClick?: () => void;
}

export function SiteNav({ profileImage, contactEmail, linkedinUrl, githubUrl }: SiteNavProps) {
  const [activeSection, setActiveSection] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);

  /**
   * Scroll-spy against the window. The rail is sticky but the document itself
   * scrolls, so this listens to the window exactly as the top nav did.
   */
  useEffect(() => {
    const handleScroll = () => {
      // At the very bottom, the last section may be too short to ever cross
      // the trigger line - select it explicitly.
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 50;
      if (atBottom) {
        setActiveSection(sections[sections.length - 1].id);
        return;
      }

      const triggerPoint = window.innerHeight / 3;
      let current = sections[0].id;

      sections.forEach((section) => {
        const el = document.getElementById(section.id);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (rect.top <= triggerPoint && rect.bottom >= 0) {
          current = section.id;
        }
      });

      setActiveSection(current);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMenuOpen(false);
  };

  // Built from the CMS contact record; each icon only renders if its value is set.
  const socials: Social[] = [];
  if (contactEmail) {
    socials.push({
      key: 'email',
      href: `mailto:${contactEmail}`,
      label: 'Email',
      Icon: LuMail,
      onClick: () => trackClick('click_email', 'nav'),
    });
  }
  if (githubUrl) {
    socials.push({ key: 'github', href: githubUrl, label: 'GitHub', Icon: LuGithub, external: true });
  }
  if (linkedinUrl) {
    socials.push({
      key: 'linkedin',
      href: linkedinUrl,
      label: 'LinkedIn',
      Icon: LuLinkedin,
      external: true,
      onClick: () => trackClick('click_linkedin', 'nav'),
    });
  }

  const renderSocials = (tone: 'dark' | 'light') =>
    socials.map(({ key, href, label, Icon, external, onClick }) => (
      <IconButton
        key={key}
        asChild
        aria-label={label}
        variant="ghost"
        size="md"
        colorPalette="brand"
        color={tone === 'dark' ? 'text.muted' : undefined}
        _hover={tone === 'dark' ? { color: 'accent.link', bg: 'bg.darkAlt' } : undefined}
      >
        <a
          href={href}
          onClick={onClick}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          <Icon size={22} />
        </a>
      </IconButton>
    ));

  return (
    <>
      {/* ── Desktop: dark left rail ─────────────────────────────── */}
      <Box
        as="header"
        data-testid="site-nav"
        display={{ base: 'none', lg: 'flex' }}
        flexDirection="column"
        position="sticky"
        top="0"
        alignSelf="flex-start"
        h="100dvh"
        w={RAIL_WIDTH}
        flexShrink={0}
        bg="bg.dark"
        color="text.inverse"
        px="5"
        py="6"
      >
        {/* Identity card */}
        <Flex
          as="button"
          align="center"
          gap="3"
          w="full"
          bg="bg.darkAlt"
          borderRadius="xl"
          p="4"
          textAlign="left"
          cursor="pointer"
          onClick={() => scrollToSection('home')}
          aria-label="Back to top"
        >
          <Avatar.Root size="lg" shape="rounded" colorPalette="brand" flexShrink={0}>
            <Avatar.Fallback name="Henry Melo" />
            {profileImage && <Avatar.Image src={profileImage} alt="" />}
          </Avatar.Root>
          <Box minW="0">
            <Text textStyle="label" color="text.inverse" lineHeight="1.2">
              Henry Melo
            </Text>
            <Text textStyle="caption" color="text.muted" fontSize="xs" mt="1" lineHeight="1.35">
              {ROLE}
            </Text>
          </Box>
        </Flex>

        <Flex
          as="nav"
          data-testid="nav-links"
          direction="column"
          align="stretch"
          gap="1"
          mt="8"
          flex="1"
        >
          {sections.map((section) => {
            const active = activeSection === section.id;
            return (
              <Button
                key={section.id}
                data-testid={`nav-link-${section.id}`}
                variant="ghost"
                justifyContent="flex-start"
                size="sm"
                px="3"
                borderRadius="base"
                textStyle="appUI"
                color={active ? 'accent.link' : 'text.muted'}
                bg={active ? 'bg.darkAlt' : 'transparent'}
                fontWeight={active ? 'semibold' : 'normal'}
                aria-current={active ? 'true' : undefined}
                _hover={{ bg: 'bg.darkAlt', color: active ? 'accent.link' : 'text.inverse' }}
                onClick={() => scrollToSection(section.id)}
              >
                {section.label}
              </Button>
            );
          })}
        </Flex>

        {/* Socials */}
        {socials.length > 0 && (
          <Flex gap="3" mt="4" justify="center" align="center">
            {renderSocials('dark')}
          </Flex>
        )}
      </Box>

      {/* ── Mobile: slim top bar + drawer ───────────────────────── */}
      <Box
        as="header"
        display={{ base: 'flex', lg: 'none' }}
        position="sticky"
        top="0"
        zIndex="1400"
        bg="bg.surface"
        borderBottomWidth="1px"
        borderColor="border.default"
      >
        <Flex w="full" h={NAV_HEIGHT} align="center" justify="space-between" gap="4" px="6">
          <Flex
            as="button"
            align="center"
            gap="3"
            minW="0"
            cursor="pointer"
            onClick={() => scrollToSection('home')}
            aria-label="Back to top"
          >
            <Avatar.Root size="sm" shape="full" colorPalette="brand" flexShrink={0}>
              <Avatar.Fallback name="Henry Melo" />
              {profileImage && <Avatar.Image src={profileImage} alt="" />}
            </Avatar.Root>
            <Text textStyle="label" truncate>
              Henry Melo
            </Text>
          </Flex>

          <Drawer.Root open={menuOpen} onOpenChange={(e) => setMenuOpen(e.open)}>
            <Drawer.Trigger asChild>
              <IconButton
                data-testid="nav-menu-trigger"
                aria-label="Open menu"
                variant="ghost"
                colorPalette="brand"
              >
                <LuMenu />
              </IconButton>
            </Drawer.Trigger>
            <Portal>
              <Drawer.Backdrop />
              <Drawer.Positioner>
                <Drawer.Content>
                  <Drawer.Header>
                    <Drawer.Title textStyle="label">Menu</Drawer.Title>
                    <Drawer.CloseTrigger asChild>
                      <CloseButton size="sm" />
                    </Drawer.CloseTrigger>
                  </Drawer.Header>
                  <Drawer.Body>
                    <Flex direction="column" align="stretch" gap="1">
                      {sections.map((section) => (
                        <Button
                          key={section.id}
                          variant="ghost"
                          colorPalette="brand"
                          justifyContent="flex-start"
                          textStyle="appUI"
                          color={
                            activeSection === section.id ? 'accent.brand' : 'text.secondary'
                          }
                          onClick={() => scrollToSection(section.id)}
                        >
                          {section.label}
                        </Button>
                      ))}
                      {socials.length > 0 && (
                        <Flex gap="3" mt="4" justify="center">
                          {renderSocials('light')}
                        </Flex>
                      )}
                    </Flex>
                  </Drawer.Body>
                </Drawer.Content>
              </Drawer.Positioner>
            </Portal>
          </Drawer.Root>
        </Flex>
      </Box>
    </>
  );
}
