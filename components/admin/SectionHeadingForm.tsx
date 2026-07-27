'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, VStack } from '@chakra-ui/react';
import { updateSectionHeadings, type ActionResult } from '@/app/admin/actions';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { EditorField } from '@/components/admin/FormField';
import { SaveBar } from '@/components/admin/SaveBar';

/**
 * The editable section heading shown above a collection manager.
 *
 * Projects and Background have no content row of their own, so their titles
 * live on the henry_site_settings singleton and save through
 * updateSectionHeadings. One field per section; the action touches only the
 * field submitted, so the two editors never overwrite each other.
 */
export function SectionHeadingForm({
  name,
  defaultValue,
  hint,
}: {
  name: 'projects_heading' | 'background_heading';
  defaultValue?: string;
  hint?: string;
}) {
  const router = useRouter();
  const [result, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    async (prev, formData) => {
      const outcome = await updateSectionHeadings(prev, formData);
      if (outcome.ok) router.refresh();
      return outcome;
    },
    null
  );

  return (
    <Box
      borderWidth="1px"
      borderColor="border.default"
      borderRadius="lg"
      bg="bg.surface"
      p="5"
    >
      <form action={formAction}>
        <VStack align="stretch" gap="4">
          <EditorField label="Section heading" hint={hint}>
            <RichTextEditor
              name={name}
              defaultValue={defaultValue}
              variant="minimal"
              minH="60px"
            />
          </EditorField>

          <SaveBar result={result} label="Save heading" pending={isPending} />
        </VStack>
      </form>
    </Box>
  );
}
