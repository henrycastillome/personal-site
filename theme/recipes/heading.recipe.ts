import { defineRecipe } from '@chakra-ui/react';

/**
 * Heading recipe.
 *
 * Weight 600, not 700 - the system deliberately avoids over-bolded headlines,
 * and 700 is reserved for feature card labels. Same single family as body text.
 *
 * The size scale covers the same xs..7xl range Chakra ships with: registering a
 * recipe *replaces* the built-in one, so a shorter list would silently delete
 * sizes from every <Heading> in the app.
 *
 * Most headings on the site use `textStyle="display"|"h1"|"h2"|"h3"` instead;
 * this covers the plain Chakra <Heading> component.
 */
export const headingRecipe = defineRecipe({
  className: 'madeline-heading',
  base: {
    fontFamily: 'heading',
    fontWeight: '600',
    color: 'text.primary',
    lineHeight: '1.33',
  },
  variants: {
    size: {
      xs: { fontSize: 'xs' },
      sm: { fontSize: 'sm' },
      md: { fontSize: 'md' },
      lg: { fontSize: 'lg' },
      xl: { fontSize: 'xl' },
      '2xl': { fontSize: '2xl' },
      '3xl': { fontSize: '3xl', lineHeight: '1.28' },
      '4xl': { fontSize: '4xl', lineHeight: '1.28' },
      '5xl': { fontSize: '5xl', lineHeight: '1.25' },
      '6xl': { fontSize: '6xl', lineHeight: '1.25' },
      '7xl': { fontSize: '7xl', lineHeight: '1.2' },
    },
  },
  defaultVariants: {
    size: 'xl',
  },
});
