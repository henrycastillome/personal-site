import { Flex, Spinner } from '@chakra-ui/react';

/**
 * Suspense fallback for every admin section.
 *
 * Each admin page is an async server component that fetches its row from
 * Supabase, so there is a real gap between clicking a nav item and the form
 * appearing. This lives at the segment root, so it covers /admin and all of
 * its children; the sidebar stays put and only the content area swaps.
 */
export default function AdminLoading() {
  return (
    <Flex
      align="center"
      justify="center"
      minH="60vh"
      role="status"
      aria-label="Loading"
      data-testid="admin-loading"
    >
      <Spinner size="xl" color="accent.brand" borderWidth="3px" />
    </Flex>
  );
}
