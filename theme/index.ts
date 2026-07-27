import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';
import { colors } from './tokens/colors';
import {
  fonts,
  fontSizes,
  fontWeights,
  lineHeights,
  letterSpacings,
} from './tokens/typography';
import { radii } from './tokens/radii';
import { shadows } from './tokens/shadows';
import { durations, easings } from './tokens/transitions';
import { semanticTokens } from './semantic-tokens';
import { textStyles } from './text-styles';
import { headingRecipe } from './recipes/heading.recipe';
import { cardRecipe } from './recipes/card.recipe';

/**
 * Madeline Portfolio - Chakra UI v3 system.
 *
 * Structure mirrors the snap&go design system:
 *   tokens/          primitives (raw values)
 *   semantic-tokens  design intent -> primitives
 *   text-styles      typographic scale
 *   recipes/         component styling
 *
 * Components reference semantic tokens and textStyles. They must never write a
 * raw `var(--chakra-colors-*)`: these semantic keys are flat and quoted, so the
 * generated variable names contain an escaped dot, and hand-written guesses at
 * the name silently resolve to nothing.
 */
const config = defineConfig({
  theme: {
    tokens: {
      colors,
      fonts,
      fontSizes,
      fontWeights,
      lineHeights,
      letterSpacings,
      radii,
      shadows,
      durations,
      easings,
    },
    semanticTokens,
    textStyles,
    recipes: {
      heading: headingRecipe,
    },
    slotRecipes: {
      card: cardRecipe,
    },
    // NOTE: no `button` recipe here on purpose. Buttons use Chakra's built-in
    // one (`variant="solid" | "outline"`), and registering an override would
    // replace it wholesale - IconButton shares that recipe, so the rich text
    // toolbar's 14 IconButtons would lose their `ghost` variant and `sm` size.
  },
  globalCss: {
    // Makes Forest Ink the default for every Chakra component that reads
    // `colorPalette` - stock <Button variant="solid">, IconButton, Badge,
    // focus rings.
    ':root': {
      colorPalette: 'brand',
    },
    'html, body': {
      fontFamily: 'body',
      fontSize: 'md',
      // Body copy is Charcoal; Forest Ink is reserved for headings and links.
      color: 'text.secondary',
      lineHeight: 'normal',
      bg: 'bg.primary',
      margin: 0,
      padding: 0,
    },
    a: {
      color: 'inherit',
      textDecoration: 'none',
      _hover: {
        textDecoration: 'none',
      },
    },
    /**
     * Highlighting only repaints the background by default, leaving each
     * element's own colour underneath - so Charcoal body copy and Midnight
     * headings both sat on the teal at whatever contrast they happened to
     * give. Setting the foreground too makes selection uniform, and it is the
     * one place Deep Teal is allowed behind text.
     */
    '::selection': {
      bg: 'accent.brand',
      color: 'text.inverse',
    },
  },
});

export const system = createSystem(defaultConfig, config);
