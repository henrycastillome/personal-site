import NextLink from 'next/link';
import { Box, Card, Flex, Grid, Text } from '@chakra-ui/react';
import { PageHeader } from '@/components/admin/PageHeader';
import { ADMIN_SECTIONS } from '@/components/admin/sections';

export default function AdminDashboard() {
  return (
    <Box>
      <PageHeader
        title="Edit your site"
        description="Pick a section to change its words, formatting and images. Every save goes live immediately."
      />

      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap="4">
        {ADMIN_SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <NextLink key={section.href} href={section.href}>
              <Card.Root h="full" variant="outline" transition="all 0.2s" _hover={{ borderColor: 'accent.brand', shadow: 'raised' }}>
                <Card.Body>
                  <Flex align="center" gap="3" mb="2">
                    <Flex
                      align="center"
                      justify="center"
                      w="9"
                      h="9"
                      flexShrink={0}
                      borderRadius="md"
                      bg="bg.tinted"
                      color="accent.brand"
                    >
                      <Icon size={18} aria-hidden />
                    </Flex>
                    <Text textStyle="bodyBold" color="text.primary">
                      {section.label}
                    </Text>
                  </Flex>
                  <Text textStyle="caption" color="text.secondary">
                    {section.blurb}
                  </Text>
                </Card.Body>
              </Card.Root>
            </NextLink>
          );
        })}
      </Grid>

      <Box
        mt="8"
        p="5"
        bg="bg.surface"
        borderLeftWidth="3px"
        borderLeftColor="accent.brand"
        borderRadius="md"
      >
        <Text textStyle="captionBold" color="text.primary" mb="1">
          Changing how text looks
        </Text>
        <Text textStyle="caption" color="text.tertiary">
          Select any words in an editor, then use the size, font and colour
          dropdowns in the toolbar. Formatting applies only to what you selected,
          so you can make a single phrase larger or teal.
        </Text>
      </Box>
    </Box>
  );
}
