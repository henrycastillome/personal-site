import { defineTokens } from '@chakra-ui/react';

/**
 * Elevation - deliberately absent.
 *
 * This system creates depth by colour blocking: full-bleed white sections
 * alternating with full-bleed near-black ones. Nothing casts a shadow.
 *
 * Every token resolves to `none` on purpose, so a stray `shadow="md"` left in
 * a component is a silent no-op rather than a visual regression.
 */
const flat = { value: 'none' };

export const shadows = defineTokens.shadows({
  none: flat,
  xs: flat,
  sm: flat,
  pressed: flat,
  raised: flat,
  md: flat,
  overlay: flat,
  lg: flat,
  modal: flat,
  xl: flat,
  '2xl': flat,
  inner: flat,
});
