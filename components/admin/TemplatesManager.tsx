'use client';

import { useActionState, useState } from 'react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import { Badge, Box, Button, Flex, Grid, Text } from '@chakra-ui/react';
import { LuCheck, LuExternalLink } from 'react-icons/lu';
import { updateActiveTemplate, type ActionResult } from '@/app/admin/actions';
import { TEMPLATE_META } from '@/templates/meta';

export function TemplatesManager({ active }: { active: string }) {
  const router = useRouter();
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);

  const [result, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    async (prev, formData) => {
      const outcome = await updateActiveTemplate(prev, formData);
      if (outcome.ok) router.refresh();
      setPendingSlug(null);
      return outcome;
    },
    null
  );

  return (
    <Box>
      {result?.error && (
        <Text textStyle="caption" color="status.error" mb="3">
          {result.error}
        </Text>
      )}

      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap="4">
        {TEMPLATE_META.map((t) => {
          const isActive = t.slug === active;
          return (
            <Box
              key={t.slug}
              borderWidth="1px"
              borderColor={isActive ? 'accent.brand' : 'border.default'}
              borderRadius="lg"
              bg="bg.surface"
              p="5"
              display="flex"
              flexDirection="column"
            >
              <Flex align="center" justify="space-between" mb="2">
                <Text textStyle="bodyBold" color="text.primary">
                  {t.name}
                </Text>
                {isActive && (
                  <Badge colorPalette="brand" variant="solid" borderRadius="full" px="2">
                    <LuCheck size={12} /> Active
                  </Badge>
                )}
              </Flex>

              <Text textStyle="caption" color="text.secondary" flex="1" mb="4">
                {t.description}
              </Text>

              <Flex gap="2" align="center">
                <form action={formAction} style={{ flex: 1 }}>
                  <input type="hidden" name="template" value={t.slug} />
                  <Button
                    type="submit"
                    w="full"
                    variant={isActive ? 'outline' : 'solid'}
                    colorPalette="brand"
                    borderRadius="button"
                    size="sm"
                    disabled={isActive || isPending}
                    loading={isPending && pendingSlug === t.slug}
                    onClick={() => setPendingSlug(t.slug)}
                  >
                    {isActive ? 'Active' : 'Use this design'}
                  </Button>
                </form>

                <Button
                  asChild
                  variant="ghost"
                  colorPalette="brand"
                  size="sm"
                  borderRadius="button"
                >
                  <NextLink href={`/?template=${t.slug}`} target="_blank" rel="noopener noreferrer">
                    Preview <LuExternalLink size={14} />
                  </NextLink>
                </Button>
              </Flex>
            </Box>
          );
        })}
      </Grid>
    </Box>
  );
}
