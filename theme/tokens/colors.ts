import { defineTokens } from '@chakra-ui/react';

/**
 * Primitive color tokens - "Digital Trust, in Teal".
 *
 * A high-contrast neutral foundation (pure white to near-black) with one
 * deep teal as the entire personality. Teal is reserved for primary actions
 * and brand marks - never for body text or decoration.
 *
 * Note: the source reference lists Slate as `#5b616` and Ash as `#8a919` -
 * both five digits, which are not valid CSS colours. The six-digit values
 * from the reference's own colour guide are used here.
 */
export const colors = defineTokens.colors({
  /**
   * Deep Teal. Doubles as a Chakra `colorPalette`, so the 50-950 ramp has to
   * exist; 500 is the brand teal, 300 is the lighter Interactive Teal used for
   * secondary links.
   */
  teal: {
    50: { value: '#f0faf9' },
    100: { value: '#ccf3ee' },
    200: { value: '#99e6dd' },
    300: { value: '#2dd4bf' }, // Interactive Teal - secondary links
    400: { value: '#14b8a6' },
    500: { value: '#0d9488' }, // Deep Teal - primary CTAs, brand mark
    600: { value: '#0b7d73' },
    700: { value: '#0f6459' },
    800: { value: '#115e59' },
    900: { value: '#134e4a' },
    950: { value: '#042f2c' },
  },

  /** Neutral ramp: pure white through to near-black. */
  neutral: {
    white: { value: '#ffffff' },
    frost: { value: '#f7f8f9' }, // subtle light background
    cloud: { value: '#eef0f3' }, // dividers, hover fills
    pewter: { value: '#dedfe2' }, // borders between light sections
    ash: { value: '#8a919e' }, // helper text, disabled
    slate: { value: '#5b616e' }, // body copy, footer links
    charcoal: { value: '#141519' }, // alternate dark section
    midnight: { value: '#0a0b0d' }, // dark sections, primary text
  },

  /** Market signal colours - the only other saturated hues in the system. */
  status: {
    success: { value: '#27ad75' },
    error: { value: '#f0616d' },
    warning: { value: '#8a919e' },
    info: { value: '#0d9488' },
  },
});
