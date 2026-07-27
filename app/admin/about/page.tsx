import { Text } from '@chakra-ui/react';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { PageHeader } from '@/components/admin/PageHeader';
import { AboutForm } from './AboutForm';
import type { AboutContent } from '@/lib/types';

export default async function AboutAdminPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from('henry_about_content').select('*').single();
  const about = data as AboutContent | null;

  if (!about) {
    return (
      <>
        <PageHeader title="About me" />
        <Text textStyle="caption" color="status.error">
          No row found in henry_about_content.
        </Text>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="About me"
        description="Your bio, skills and photo. The bio supports headings, lists and links."
      />
      <AboutForm about={about} />
    </>
  );
}
