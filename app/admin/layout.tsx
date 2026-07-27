import { Box, Flex } from '@chakra-ui/react';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { AdminNav } from '@/components/admin/AdminNav';
import { Toaster } from '@/components/admin/Toaster';

export const metadata = {
  title: 'Edit site',
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Authorization boundary. Middleware only proves a session exists; this
  // checks the address against the ADMIN_EMAIL allowlist.
  const { user } = await requireAdmin();

  return (
    <Flex direction={{ base: 'column', lg: 'row' }} minH="100vh" bg="bg.surface">
      <AdminNav email={user.email ?? ''} />

      <Box
        flex="1"
        px={{ base: '6', md: '10', lg: '12' }}
        py={{ base: '8', md: '10' }}
        minW="0"
        bg="bg.surface"
      >
        <Box maxW="900px" mx="auto">
          {children}
        </Box>
      </Box>

      {/* Mounted once; every admin form's save reports through it. */}
      <Toaster />
    </Flex>
  );
}
