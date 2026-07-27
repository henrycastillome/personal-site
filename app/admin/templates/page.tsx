import { requireAdmin } from '@/lib/auth/requireAdmin';
import { PageHeader } from '@/components/admin/PageHeader';
import { TemplatesManager } from '@/components/admin/TemplatesManager';
import { DEFAULT_TEMPLATE } from '@/templates/meta';

export default async function TemplatesAdminPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from('henry_site_settings')
    .select('active_template')
    .maybeSingle();

  const active = (data?.active_template as string | undefined) ?? DEFAULT_TEMPLATE;

  return (
    <>
      <PageHeader
        title="Templates"
        description="Choose which design your public site shows. Figma and VS Code are live — visitors see each other's cursors."
      />
      <TemplatesManager active={active} />
    </>
  );
}
