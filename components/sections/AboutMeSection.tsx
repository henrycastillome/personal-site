'use client';

import { Badge, Box, Flex, Grid, Text, Image, VStack } from '@chakra-ui/react';
import { RichText } from '@/components/ui/RichText';
import type { AboutContent } from '@/lib/types';

interface AboutMeSectionProps {
  content: AboutContent;
}

export function AboutMeSection({ content }: AboutMeSectionProps) {
  return (
    <Box>
      <RichText
        as="h2"
        html={content.heading || 'About Me'}
        spacing="tight"
        textStyle="h2"
        color="text.primary"
        pb="6"
      />

      <Grid
        w="full"
        templateColumns={{ base: '1fr', xl: 'repeat(2, 1fr)' }}
        gap={{ base: '6', md: '6', '2xl': '24' }}
      >
        {/* Left column - Bio text + Skills */}
        <Box>
          <RichText
            html={content.bio}
            color="text.tertiary"
            fontSize="clamp(16px, 2vw, 20px)"
            fontWeight="400"
            lineHeight="1.7"
          />

          {/* Skills section */}
          {content.skills && content.skills.length > 0 && (
            <VStack align="start" mt="6" gap="2">
              <Text textStyle="bodyBold" color="text.primary">
                Core Skills
              </Text>
              <Flex wrap="wrap" gap="2">
                {content.skills.map((skill, index) => (
                  <Badge
                    key={index}
                    bg="bg.muted"
                    color="text.secondary"
                    borderRadius="full"
                    px="3"
                    py="1"
                    textStyle="caption"
                    fontWeight="normal"
                  >
                    {skill}
                  </Badge>
                ))}
              </Flex>
            </VStack>
          )}
        </Box>

        {/* Right column - Profile Image */}
        <Box>
          {content.profile_image ? (
            <Box
              maxW="400px"
              borderRadius="lg"
              overflow="hidden"
              bg="bg.surface"
            >
              <Image
                src={content.profile_image}
                alt="About Henry Melo"
                objectFit="cover"
                w="full"
              />
            </Box>
          ) : (
            <Box
              maxW="400px"
              borderRadius="lg"
              bg="bg.secondary"
              h="400px"
            />
          )}
        </Box>
      </Grid>
    </Box>
  );
}
