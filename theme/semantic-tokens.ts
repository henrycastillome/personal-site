import { defineSemanticTokens } from '@chakra-ui/react';

/**
 * Semantic tokens - design intent mapped onto the primitives in tokens/colors.ts.
 *
 * Two rules from the style reference drive most of this:
 *   - Deep Teal is for primary actions and the brand mark only. It is
 *     never a text colour and never decoration. Secondary links use the
 *     lighter Interactive Teal instead.
 *   - Depth comes from colour blocking, so there is no elevation token here
 *     and no surface tint beyond frost/cloud.
 *
 * Components reference THESE names, never a primitive and never a raw
 * `var(--chakra-colors-*)`: the keys are flat and quoted, so Chakra emits
 * variable names with an escaped dot and hand-written guesses resolve to
 * nothing.
 */
export const semanticTokens = defineSemanticTokens({
  colors: {
    // ─── Text ──────────────────────────────────────────────
    'text.primary': { value: '{colors.neutral.midnight}' },
    'text.secondary': { value: '{colors.neutral.slate}' }, // body copy
    'text.tertiary': { value: '{colors.neutral.slate}' },
    'text.muted': { value: '{colors.neutral.ash}' }, // helper, disabled
    'text.inverse': { value: '{colors.neutral.white}' },
    'text.link': { value: '{colors.teal.300}' }, // Interactive Teal

    // ─── Surfaces ──────────────────────────────────────────
    'bg.primary': { value: '{colors.neutral.white}' },
    'bg.surface': { value: '{colors.neutral.white}' },
    'bg.secondary': { value: '{colors.neutral.frost}' },
    'bg.muted': { value: '{colors.neutral.cloud}' },
    'bg.warm': { value: '{colors.neutral.white}' },
    'bg.canvas': { value: '{colors.neutral.white}' },
    'bg.tinted': { value: '{colors.neutral.frost}' },
    /** The dark half of the colour-blocking rhythm. */
    'bg.dark': { value: '{colors.neutral.midnight}' },
    'bg.darkAlt': { value: '{colors.neutral.charcoal}' },

    // ─── Borders ───────────────────────────────────────────
    'border.default': { value: '{colors.neutral.pewter}' },
    'border.subtle': { value: '{colors.neutral.cloud}' },
    'border.dark': { value: '{colors.neutral.ash}' },

    // ─── Accent - primary action only ──────────────────────
    'accent.brand': { value: '{colors.teal.500}' },
    'accent.brandHover': { value: '{colors.teal.600}' },
    /** Secondary links and inline interactive text. */
    'accent.link': { value: '{colors.teal.300}' },

    // ─── Status ────────────────────────────────────────────
    'status.success': { value: '{colors.status.success}' },
    'status.error': { value: '{colors.status.error}' },
    'status.warning': { value: '{colors.status.warning}' },
    'status.info': { value: '{colors.status.info}' },

    // ─── Interaction ───────────────────────────────────────
    'interactive.default': { value: '{colors.teal.500}' },
    'interactive.hover': { value: '{colors.teal.600}' },
    'interactive.active': { value: '{colors.teal.700}' },
    'interactive.disabled': { value: '{colors.neutral.cloud}' },

    /**
     * Chakra `colorPalette` slots, so the stock <Button>, <IconButton> and
     * <Badge> render Deep Teal via colorPalette="brand" (set globally in
     * theme/index.ts) instead of Chakra's default grey.
     */
    brand: {
      solid: { value: '{colors.teal.500}' },
      contrast: { value: '{colors.neutral.white}' },
      fg: { value: '{colors.teal.500}' },
      muted: { value: '{colors.neutral.cloud}' },
      subtle: { value: '{colors.neutral.frost}' },
      emphasized: { value: '{colors.teal.600}' },
      focusRing: { value: '{colors.teal.500}' },
      border: { value: '{colors.teal.500}' },
    },
  },
});
