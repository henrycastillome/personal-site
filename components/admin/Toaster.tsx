'use client';

import {
  Toaster as ChakraToaster,
  Portal,
  Spinner,
  Stack,
  Toast,
  createToaster,
} from '@chakra-ui/react';

/**
 * Shared toaster for the CMS.
 *
 * Module-level instance so any admin component can call `toaster.create(...)`
 * without prop-drilling; `<Toaster />` is mounted once in app/admin/layout.tsx.
 */
export const toaster = createToaster({
  placement: 'top',
  pauseOnPageIdle: true,
});

export function Toaster() {
  return (
    <Portal>
      <ChakraToaster toaster={toaster} insetInline={{ mdDown: '4' }}>
        {(toast) => (
          <Toast.Root width={{ md: 'sm' }} colorPalette="brand">
            {toast.type === 'loading' ? (
              <Spinner size="sm" color="accent.brand" />
            ) : (
              <Toast.Indicator />
            )}
            <Stack gap="1" flex="1" maxW="full">
              {toast.title && (
                <Toast.Title textStyle="captionBold">{toast.title}</Toast.Title>
              )}
              {toast.description && (
                <Toast.Description textStyle="caption">
                  {toast.description}
                </Toast.Description>
              )}
            </Stack>
            {toast.closable && <Toast.CloseTrigger />}
          </Toast.Root>
        )}
      </ChakraToaster>
    </Portal>
  );
}
