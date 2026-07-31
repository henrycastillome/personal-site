'use client';

import { useActionState } from 'react';
import { VStack } from '@chakra-ui/react';
import { updateAbout, type ActionResult } from '@/app/admin/actions';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { EditorField } from '@/components/admin/FormField';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { MultiImageUploader } from '@/components/admin/MultiImageUploader';
import { TagListInput } from '@/components/admin/TagListInput';
import { SaveBar } from '@/components/admin/SaveBar';
import type { AboutContent } from '@/lib/types';

export function AboutForm({ about }: { about: AboutContent }) {
  const [result, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    updateAbout,
    null
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={about.id} />

      <VStack align="stretch" gap="6">
        <EditorField label="Section heading">
          <RichTextEditor
            name="heading"
            defaultValue={about.heading}
            variant="minimal"
            minH="60px"
          />
        </EditorField>

        <EditorField
          label="Bio"
          hint="Use Enter for a new paragraph. Bold, headings, lists and links all work."
        >
          <RichTextEditor name="bio" defaultValue={about.bio} minH="260px" />
        </EditorField>

        <TagListInput
          label="Core skills"
          name="skills"
          defaultValue={about.skills}
          hint="Press Enter after each skill. Shown as grey pills under the bio."
        />

        <ImageUploader
          label="Photo"
          name="profile_image"
          folder="about"
          defaultValue={about.profile_image}
        />

        <MultiImageUploader
          label="More photos"
          name="gallery_images"
          folder="about"
          defaultValue={about.gallery_images ?? (about.secondary_image ? [about.secondary_image] : [])}
          hint="Optional. Stacked under the first photo to fill space next to a long bio. Add as many as you like."
        />

        <SaveBar result={result} pending={isPending} />
      </VStack>
    </form>
  );
}
