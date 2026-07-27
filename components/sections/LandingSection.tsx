'use client';

import { Button, VStack, Flex } from '@chakra-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { RichText } from '@/components/ui/RichText';
import { trackClick } from '@/lib/analytics/track';
import type { HeroContent } from '@/lib/types';

interface LandingSectionProps {
  content: HeroContent;
  /** Both come from the Contact section - the hero has no fields of its own. */
  contactEmail?: string;
  linkedinUrl?: string;
}

export function LandingSection({
  content,
  contactEmail,
  linkedinUrl,
}: LandingSectionProps) {
  // Width is owned by PageSection now - no local max-width here.
  return (
    <VStack align="start" gap="6" w="full" data-testid="hero">
      {/* Lead-in line, then the headline. Both come from the CMS. */}
      <RichText
        html={content.greeting}
        spacing="tight"
        textStyle="eyebrow"
        color="accent.brand"
      />

      {/* The old `title` field is retired - the greeting above carries the
          lead-in, and this is the headline itself. */}
      <RichText
        as="h1"
        html={content.subtitle}
        spacing="tight"
        textStyle="display"
        color="text.primary"
      />
      <RichText html={content.description} textStyle="body" color="text.tertiary" />

      {/*
        These used to scroll to Projects and to a Contact form that no longer
        exists. Each renders only when its field is filled in, so a cleared
        LinkedIn URL removes the button rather than leaving a dead link.
      */}
      <Flex gap="4" flexWrap="wrap">
        {contactEmail && (
          <Button asChild variant="solid" size="lg" borderRadius="button" data-testid="hero-cta-email">
            <a href={`mailto:${contactEmail}`} onClick={() => trackClick('click_email', 'hero')}>
              {content.cta_text || 'Email me'}
              <FontAwesomeIcon icon={faEnvelope} />
            </a>
          </Button>
        )}
        {linkedinUrl && (
          <Button asChild variant="outline" size="lg" borderRadius="button" data-testid="hero-cta-linkedin">
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackClick('click_linkedin', 'hero')}
            >
              {content.cta_secondary_text || "Let's connect"}
              <FontAwesomeIcon icon={faLinkedin} />
            </a>
          </Button>
        )}
      </Flex>
    </VStack>
  );
}
