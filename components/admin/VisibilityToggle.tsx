'use client';

import { useState } from 'react';
import { Switch } from '@chakra-ui/react';

/**
 * Controls `is_visible`. Chakra's Switch supplies the control semantics and
 * keyboard behaviour; the hidden input carries "true"/"false" into the form
 * action, which is what the server action's bool() parses.
 */
export function VisibilityToggle({
  name,
  defaultChecked = true,
}: {
  name: string;
  defaultChecked?: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <>
      <Switch.Root
        checked={checked}
        onCheckedChange={(e) => setChecked(e.checked)}
        colorPalette="brand"
      >
        <Switch.HiddenInput />
        <Switch.Control />
        <Switch.Label textStyle="captionBold" color="text.secondary">
          {checked ? 'Visible on site' : 'Hidden'}
        </Switch.Label>
      </Switch.Root>

      <input type="hidden" name={name} value={checked ? 'true' : 'false'} readOnly />
    </>
  );
}
