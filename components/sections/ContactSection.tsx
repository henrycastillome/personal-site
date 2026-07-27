'use client';

import { Box, Grid, VStack, Text, Flex, Link } from '@chakra-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { RichText } from '@/components/ui/RichText';
import { trackClick } from '@/lib/analytics/track';
import type { ContactContent } from '@/lib/types';

interface ContactSectionProps {
  content: ContactContent;
}

export function ContactSection({ content }: ContactSectionProps) {
  return (
    <Grid
      w="full"
      templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
      gap={{ base: '10', md: '20' }}
      alignItems="center"
    >
      {/* Left column - Bold heading */}
      <RichText
        as="h2"
        html={content.heading}
        spacing="tight"
        textStyle="h1"
        color="text.primary"
      />

      {/* Right column - Contact details */}
      <VStack align="start" gap="8">
        {/* Email */}
        <Box>
          <Flex align="center" gap="3" mb="2" color="text.primary">
            <FontAwesomeIcon icon={faEnvelope} />
            <Text textStyle="label" color="text.primary">
              Email
            </Text>
          </Flex>
          <Link
            href={`mailto:${content.email}`}
            onClick={() => trackClick('click_email', 'contact')}
            textStyle="link"
            color="accent.brand"
            css={{
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            {content.email}
          </Link>
        </Box>

        {/* LinkedIn */}
        {content.linkedin_url && (
          <Box>
            <Flex align="center" gap="3" mb="2" color="text.primary">
              <FontAwesomeIcon icon={faLinkedin} />
              <Text textStyle="label" color="text.primary">
                LinkedIn
              </Text>
            </Flex>
            <Link
              href={content.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackClick('click_linkedin', 'contact')}
              textStyle="link"
              color="accent.brand"
              css={{
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              {content.subheading || 'View my profile'}
            </Link>
          </Box>
        )}
      </VStack>
    </Grid>
  );
}
