'use client';

import { Box, Flex } from '@chakra-ui/react';
import { SiteNav } from './SiteNav';

interface MainLayoutProps {
  children: React.ReactNode;
  profileImage?: string;
  contactEmail?: string;
  linkedinUrl?: string;
  githubUrl?: string;
}

/**
 * Public site shell: a fixed dark rail on the left (desktop) with a normally-
 * scrolling document beside it. On mobile the rail collapses to a slim sticky
 * top bar with a drawer. Either way the document scrolls, which is what lets
 * the rail's scroll-spy listen to the window.
 */
export function MainLayout({
  children,
  profileImage,
  contactEmail,
  linkedinUrl,
  githubUrl,
}: MainLayoutProps) {
  return (
    <Flex direction={{ base: 'column', lg: 'row' }} minH="100vh" bg="bg.primary">
      <SiteNav
        profileImage={profileImage}
        contactEmail={contactEmail}
        linkedinUrl={linkedinUrl}
        githubUrl={githubUrl}
      />
      <Box as="main" flex="1" minW="0">
        {children}
      </Box>
    </Flex>
  );
}
