'use client';

import { useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Box, Button, Flex, Spinner } from '@chakra-ui/react';
import { toaster } from '@/components/admin/Toaster';
import type { ActionResult } from '@/app/admin/actions';

interface SaveBarProps {
  result: ActionResult | null;
  label?: string;
  children?: React.ReactNode;
  /**
   * Pending state from the form's useActionState (its third return value).
   *
   * These forms dispatch through useActionState, and useFormStatus does NOT
   * report pending for that path - verified against the running app: with the
   * server action held open for 3s the button never entered a loading state.
   * So the caller passes isPending in; useFormStatus is only a fallback for any
   * plain form action that does not.
   */
  pending?: boolean;
}

/**
 * Sticky submit row. Render it inside the <form>.
 *
 * Save feedback is a toast rather than inline text, so it is visible even when
 * the save button has been scrolled past on a long editor page.
 */
export function SaveBar({
  result,
  label = 'Save changes',
  children,
  pending: pendingProp,
}: SaveBarProps) {
  const status = useFormStatus();
  const pending = pendingProp ?? status.pending;

  /**
   * Each save returns a fresh result object, so identity is what tells one
   * save from the next. Comparing against the last one also keeps React's
   * development double-invoke from firing the toast twice.
   */
  const lastResult = useRef<ActionResult | null>(null);

  useEffect(() => {
    if (!result || result === lastResult.current) return;
    lastResult.current = result;

    /**
     * Deferred to a microtask on purpose. `toaster.create` flushes
     * synchronously, and calling it directly in the effect lands inside
     * React's commit phase - which throws "flushSync was called from inside a
     * lifecycle method". Queuing it lets the commit finish first.
     */
    queueMicrotask(() => {
      if (result.ok) {
        toaster.create({
          type: 'success',
          title: 'Saved',
          description: 'Your site is updated.',
          duration: 3000,
        });
      } else {
        toaster.create({
          type: 'error',
          title: "Couldn't save",
          description: result.error ?? 'Something went wrong.',
          duration: 6000,
        });
      }
    });
  }, [result]);

  return (
    <>
      <Flex
        position="sticky"
        bottom="0"
        // A sticky element with no z-index can be painted over by later
        // positioned siblings - on the list pages the next card's form sits
        // after this one - which swallows the hover on the button beneath.
        zIndex="1"
        align="center"
        gap="4"
        wrap="wrap"
        mt="2"
        py="4"
        bg="bg.surface"
        borderTopWidth="1px"
        borderColor="border.default"
      >
        <Button
          data-testid="save-button"
          type="submit"
          variant="solid"
          borderRadius="button"
          cursor="pointer"
          // The spinner is composed by hand rather than via the `loading` prop:
          // this project's Button is the bare @chakra-ui/react one, whose
          // `loading`/`loadingText` props only toggle styling state and inject
          // no spinner element (verified against the running app). `disabled`
          // becomes true only once the submission is in flight, so it guards
          // against a double submit without cancelling the first one.
          disabled={pending}
        >
          {pending && <Spinner size="sm" borderWidth="2px" marginEnd="2" />}
          {pending ? 'Saving…' : label}
        </Button>

        {children}
      </Flex>

      {/*
        Trailing room so the sticky bar has somewhere to settle. Without it the
        bar is the last thing in the form, so it stays pinned to the bottom of
        the viewport for the whole scroll - permanently floating over the
        fields above and intercepting their pointer events.
      */}
      <Box h="16" flexShrink={0} aria-hidden />
    </>
  );
}
