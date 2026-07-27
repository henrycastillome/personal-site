import { defineTokens } from '@chakra-ui/react';

/**
 * Border radius scale.
 *
 * Nothing in this system has sharp corners. The 56px primary button radius is
 * a signature - an elongated pill rather than a true capsule - while tags and
 * secondary pills use the effectively-infinite 100000px.
 */
export const radii = defineTokens.radii({
  none: { value: '0' },
  sm: { value: '4px' },
  base: { value: '8px' }, // inputs
  md: { value: '8px' },
  lg: { value: '12px' },
  xl: { value: '16px' },
  '2xl': { value: '20px' },
  '3xl': { value: '24px' }, // content cards
  button: { value: '56px' }, // primary CTA signature
  full: { value: '100000px' }, // tags, secondary pills
});
