import { Text } from '@chakra-ui/react';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { PageHeader } from '@/components/admin/PageHeader';
import { HeroForm } from './HeroForm';
import type { HeroContent } from '@/lib/types';

export default async function HeroAdminPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from('henry_hero_content').select('*').single();
  const hero = data as HeroContent | null;

  if (!hero) {
    return (
      <>
        <PageHeader title="Hero section" />
        <Text textStyle="caption" color="status.error">
          No hero row found in henry_hero_content. Run the seed insert from
          supabase/migrations/001_initial_schema.sql first.
        </Text>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Hero section"
        description="The first thing visitors read. Select any words to change their size, font or colour."
      />
      <HeroForm hero={hero} />
    </>
  );
}
