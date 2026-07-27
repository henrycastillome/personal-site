'use client';

import { useRef, useState } from 'react';
import {
  Button,
  CloseButton,
  Dialog,
  Flex,
  Portal,
  Text,
} from '@chakra-ui/react';
import { LuLogOut } from 'react-icons/lu';

/**
 * Sign out, with a confirmation step.
 *
 * The underlying POST to /auth/signout always worked, but it is a full-page
 * form submission: the button gave no response, the redirect took a moment,
 * and it read as a dead control. Hence the confirm dialog and the pending
 * state on the confirm button.
 *
 * Sign-out is worth confirming here specifically because getting back in is
 * expensive - there is no password, so it costs a magic link or an SMS code,
 * both of which are rate limited.
 *
 * The real <form> is kept rather than fetch(): the route replies with a 303 to
 * /login and the browser follows it, so the session is gone from the document
 * as well as from the cookie jar. A fetch would leave the current page sitting
 * on stale, now-unauthorised content.
 */
export function SignOutButton() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Dialog.Root
      open={open}
      // Once the POST is away the page is navigating; letting the dialog close
      // would flash the admin UI back up mid-redirect.
      onOpenChange={(e) => !pending && setOpen(e.open)}
      role="alertdialog"
      size="sm"
    >
      <Dialog.Trigger asChild>
        <Flex
          as="button"
          w="full"
          align="center"
          justify="center"
          gap="2"
          px="3"
          py="2"
          borderWidth="1px"
          borderColor="border.default"
          borderRadius="md"
          cursor="pointer"
          color="text.secondary"
          _hover={{ bg: 'bg.secondary', color: 'text.primary' }}
          data-testid="admin-signout"
        >
          <LuLogOut size={15} />
          <Text textStyle="captionBold">Sign out</Text>
        </Flex>
      </Dialog.Trigger>

      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content data-testid="admin-signout-dialog">
            <Dialog.Header>
              <Dialog.Title textStyle="label">Sign out?</Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" disabled={pending} />
              </Dialog.CloseTrigger>
            </Dialog.Header>

            <Dialog.Body>
              <Text textStyle="body" color="text.secondary">
                You will need a new sign-in link or code to get back in.
              </Text>
            </Dialog.Body>

            <Dialog.Footer>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={pending}
                data-testid="admin-signout-cancel"
              >
                Cancel
              </Button>

              <form ref={formRef} action="/auth/signout" method="post">
                <Button
                  type="submit"
                  colorPalette="brand"
                  loading={pending}
                  loadingText="Signing out"
                  data-testid="admin-signout-confirm"
                  onClick={(event) => {
                    // Chakra's `loading` also disables the button, and a
                    // disabled submitter cancels the native submission. So
                    // drive the submit from the form instead of relying on the
                    // default action surviving the re-render.
                    event.preventDefault();
                    setPending(true);
                    formRef.current?.requestSubmit();
                  }}
                >
                  Sign out
                </Button>
              </form>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
