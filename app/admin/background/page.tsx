import { requireAdmin } from '@/lib/auth/requireAdmin';
import { PageHeader } from '@/components/admin/PageHeader';
import { BackgroundManager } from './BackgroundManager';
import type { WorkHistory } from '@/lib/types';

export default async function BackgroundAdminPage() {
  const { supabase } = await requireAdmin();
  const [{ data }, { data: settings }] = await Promise.all([
    supabase.from('henry_work_history').select('*').order('order_index'),
    supabase.from('henry_site_settings').select('background_heading').maybeSingle(),
  ]);

  return (
    <>
      <PageHeader
        title="Background"
        description="The career timeline. Each entry becomes a circle with its year range, role and company logos."
      />
      <BackgroundManager
        entries={(data as WorkHistory[]) ?? []}
        heading={settings?.background_heading ?? undefined}
      />
    </>
  );
}
