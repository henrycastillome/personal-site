import { defineTokens } from '@chakra-ui/react';

/**
 * Typography tokens.
 *
 * Two roles: a display face for large headlines only, and a workhorse sans for
 * everything else. The Coinbase suite is licence-restricted; these are the
 * substitutes the style reference names, loaded by next/font in
 * app/layout.tsx.
 */
const display = `var(--font-display), Manrope, ui-sans-serif, system-ui, -apple-system, sans-serif`;
const sans = `var(--font-body-sans), Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;

export const fonts = defineTokens.fonts({
  heading: { value: display },
  body: { value: sans },
  mono: { value: `Menlo, Monaco, 'Courier New', monospace` },
});

export const fontSizes = defineTokens.fontSizes({
  xs: { value: '13px' }, // caption
  sm: { value: '14px' },
  md: { value: '16px' }, // body
  lg: { value: '18px' }, // subheading
  xl: { value: '20px' },
  '2xl': { value: '28px' }, // heading-sm
  '3xl': { value: '36px' },
  '4xl': { value: '44px' }, // heading
  '5xl': { value: '52px' },
  '6xl': { value: '64px' }, // heading-lg
  '7xl': { value: '72px' },
  '8xl': { value: '80px' }, // display
});

export const fontWeights = defineTokens.fontWeights({
  normal: { value: '400' },
  semibold: { value: '600' },
  bold: { value: '700' },
});

/** Headlines run near-solid; body copy is deliberately breathable. */
export const lineHeights = defineTokens.lineHeights({
  display: { value: '1' },
  heading: { value: '1.09' },
  headingSm: { value: '1.25' },
  normal: { value: '1.5' },
  subheading: { value: '1.56' },
  caption: { value: '1.54' },
});

export const letterSpacings = defineTokens.letterSpacings({
  tight: { value: '-0.02em' },
  normal: { value: '0' },
  wide: { value: '0.02em' },
});
