import { defineTextStyles } from '@chakra-ui/react';

/**
 * Text styles.
 *
 * The display face is reserved for large headlines - `display`, `h1` and `h2`.
 * Everything from `h3` down is the workhorse sans. Headlines run at weight 400
 * with near-solid line height, which is what gives them their declarative,
 * architectural feel; body copy is deliberately breathable at 1.5-1.56.
 *
 * Desktop sizes come from the type scale; smaller breakpoints scale down so an
 * 80px headline does not overflow a phone.
 */
export const textStyles = defineTextStyles({
  display: {
    value: {
      fontFamily: 'heading',
      fontSize: '40px',
      fontWeight: '400',
      lineHeight: '1.05',
      letterSpacing: '-0.02em',
      sm: { fontSize: '52px' },
      md: { fontSize: '64px' },
      lg: { fontSize: '80px', lineHeight: '1' },
    },
  },
  h1: {
    value: {
      fontFamily: 'heading',
      fontSize: '36px',
      fontWeight: '400',
      lineHeight: '1.09',
      letterSpacing: '-0.02em',
      sm: { fontSize: '44px' },
      md: { fontSize: '64px', lineHeight: '1' },
    },
  },
  h2: {
    value: {
      fontFamily: 'heading',
      fontSize: '28px',
      fontWeight: '400',
      lineHeight: '1.09',
      letterSpacing: '-0.02em',
      md: { fontSize: '44px' },
    },
  },
  h3: {
    value: {
      fontFamily: 'body',
      fontSize: '24px',
      fontWeight: '600',
      lineHeight: '1.25',
      md: { fontSize: '32px' },
    },
  },
  subheading: {
    value: {
      fontFamily: 'body',
      fontSize: '20px',
      fontWeight: '400',
      lineHeight: '1.56',
    },
  },
  body: {
    value: {
      fontFamily: 'body',
      fontSize: '18px',
      fontWeight: '400',
      lineHeight: '1.5',
    },
  },
  bodyBold: {
    value: {
      fontFamily: 'body',
      fontSize: '18px',
      fontWeight: '600',
      lineHeight: '1.5',
    },
  },
  appUI: {
    value: {
      fontFamily: 'body',
      fontSize: '17px',
      fontWeight: '400',
      lineHeight: '1.5',
    },
  },
  label: {
    value: {
      fontFamily: 'body',
      fontSize: '17px',
      fontWeight: '600',
      lineHeight: '1.5',
    },
  },
  /** The hero's small intro line above the headline. */
  eyebrow: {
    value: {
      fontFamily: 'body',
      fontSize: '17px',
      fontWeight: '600',
      lineHeight: '1.5',
    },
  },
  link: {
    value: {
      fontFamily: 'body',
      fontSize: '17px',
      fontWeight: '400',
      lineHeight: '1.5',
    },
  },
  button: {
    value: {
      fontFamily: 'body',
      fontSize: '17px',
      fontWeight: '600',
      lineHeight: '1.5',
    },
  },
  caption: {
    value: {
      fontFamily: 'body',
      fontSize: '15px',
      fontWeight: '400',
      lineHeight: '1.54',
    },
  },
  captionBold: {
    value: {
      fontFamily: 'body',
      fontSize: '15px',
      fontWeight: '600',
      lineHeight: '1.54',
    },
  },
});
