import { defineSlotRecipe } from '@chakra-ui/react';
import { transitions } from '../tokens/transitions';

/**
 * Card slot recipe.
 *
 * Chakra ships `card` as a *slot* recipe (root/header/body/footer/title/
 * description), so this overrides theme.slotRecipes.card - not theme.recipes.
 *
 * The study-set card is the reference shape: white surface on the cool gray
 * canvas, 1px hairline border, 8px radius, 24px padding. Elevation stays under
 * 16px blur at 10% opacity and shadows are never stacked.
 */
export const cardRecipe = defineSlotRecipe({
  className: 'madeline-card',
  slots: ['root', 'header', 'body', 'footer', 'title', 'description'],
  base: {
    root: {
      bg: 'bg.surface',
      borderRadius: 'lg', // 8px
      overflow: 'hidden',
      transition: transitions.normal,
    },
    header: { p: '6', pb: '2' },
    body: { p: '6' },
    footer: { p: '6', pt: '2' },
    title: { textStyle: 'bodyBold', color: 'text.primary' },
    description: { textStyle: 'caption', color: 'text.tertiary' },
  },
  variants: {
    variant: {
      /** Study-set card: hairline border, gentle lift on hover. */
      elevated: {
        root: {
          borderWidth: '1px',
          borderColor: 'border.default',
          _hover: { boxShadow: 'md' },
        },
      },
      outline: {
        root: {
          borderWidth: '1px',
          borderColor: 'border.default',
        },
      },
      /**
       * Tinted promo panel. The lilac is a *section* background, so anything
       * sitting inside this needs its own white inner panel.
       */
      subtle: {
        root: { bg: 'bg.tinted' },
      },
    },
    size: {
      sm: {
        header: { p: '4', pb: '2' },
        body: { p: '4' },
        footer: { p: '4', pt: '2' },
      },
      md: {
        header: { p: '6', pb: '2' },
        body: { p: '6' },
        footer: { p: '6', pt: '2' },
      },
      lg: {
        header: { p: '8', pb: '3' },
        body: { p: '8' },
        footer: { p: '8', pt: '3' },
      },
    },
  },
  defaultVariants: {
    variant: 'elevated',
    size: 'md',
  },
});
