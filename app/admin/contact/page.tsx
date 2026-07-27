import { Text } from '@chakra-ui/react';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { PageHeader } from '@/components/admin/PageHeader';
import { ContactForm } from './ContactForm';
import type { ContactContent } from '@/lib/types';

export default async function ContactAdminPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from('henry_contact_content').select('*').single();
  const contact = data as ContactContent | null;

  if (!contact) {
    return (
      <>
        <PageHeader title="Contact" />
        <Text textStyle="caption" color="status.error">
          No row found in henry_contact_content.
        </Text>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Contact"
        description="The closing section, plus the email and LinkedIn shown in the sidebar."
      />
      <ContactForm contact={contact} />
    </>
  );
}
