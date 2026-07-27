'use client';

import { useActionState } from 'react';
import { VStack } from '@chakra-ui/react';
import { updateContact, type ActionResult } from '@/app/admin/actions';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { FormField, EditorField } from '@/components/admin/FormField';
import { SaveBar } from '@/components/admin/SaveBar';
import type { ContactContent } from '@/lib/types';

export function ContactForm({ contact }: { contact: ContactContent }) {
  const [result, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    updateContact,
    null
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={contact.id} />

      <VStack align="stretch" gap="6">
        <EditorField label="Heading" hint="The large closing statement.">
          <RichTextEditor
            name="heading"
            defaultValue={contact.heading}
            variant="minimal"
            minH="80px"
          />
        </EditorField>

        <FormField
          label="LinkedIn link text"
          name="subheading"
          defaultValue={contact.subheading}
          placeholder="View my profile"
          hint="The words shown for the LinkedIn link."
        />

        <FormField
          label="Email address"
          name="email"
          type="email"
          required
          defaultValue={contact.email}
        />
        <FormField
          label="LinkedIn URL"
          name="linkedin_url"
          defaultValue={contact.linkedin_url}
          placeholder="https://linkedin.com/in/..."
        />
        <FormField label="Phone" name="phone" defaultValue={contact.phone} />
        <FormField label="Location" name="location" defaultValue={contact.location} />
        <FormField
          label="Twitter / X URL"
          name="twitter_url"
          defaultValue={contact.twitter_url}
        />
        <FormField
          label="GitHub URL"
          name="github_url"
          defaultValue={contact.github_url}
        />

        <SaveBar result={result} pending={isPending} />
      </VStack>
    </form>
  );
}
