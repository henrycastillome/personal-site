'use client';

import { useActionState } from 'react';
import { VStack } from '@chakra-ui/react';
import { updateHero, type ActionResult } from '@/app/admin/actions';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { FormField, EditorField } from '@/components/admin/FormField';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { SaveBar } from '@/components/admin/SaveBar';
import type { HeroContent } from '@/lib/types';

export function HeroForm({ hero }: { hero: HeroContent }) {
  const [result, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    updateHero,
    null
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={hero.id} />

      <VStack align="stretch" gap="6">
        <EditorField
          label="Greeting"
          hint={`The lead-in line above the headline - e.g. "Hi, I'm Henry Melo. I am a".`}
        >
          <RichTextEditor
            name="greeting"
            defaultValue={hero.greeting}
            variant="minimal"
            minH="60px"
          />
        </EditorField>

        <EditorField
          label="Headline"
          hint="The big statement under the greeting."
        >
          <RichTextEditor
            name="subtitle"
            defaultValue={hero.subtitle}
            variant="minimal"
            minH="70px"
          />
        </EditorField>

        <EditorField label="Intro paragraph">
          <RichTextEditor
            name="description"
            defaultValue={hero.description}
            minH="120px"
          />
        </EditorField>

        <FormField
          label="Primary button label"
          name="cta_text"
          defaultValue={hero.cta_text}
          placeholder="Email me"
          hint="Opens your email address - edit the address itself under Contact."
        />
        <FormField
          label="Secondary button label"
          name="cta_secondary_text"
          defaultValue={hero.cta_secondary_text}
          placeholder="Let's connect"
          hint="Opens your LinkedIn profile - edit the URL itself under Contact. Clear the LinkedIn URL there to hide this button."
        />

        <ImageUploader
          label="Profile photo"
          name="profile_image"
          folder="hero"
          defaultValue={hero.profile_image}
          hint="Shown in the top navigation bar."
        />

        <SaveBar result={result} pending={isPending} />
      </VStack>
    </form>
  );
}
