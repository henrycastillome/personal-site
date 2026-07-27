import { Box, type BoxProps } from '@chakra-ui/react';

interface RichTextProps extends Omit<BoxProps, 'children' | 'dangerouslySetInnerHTML'> {
  /** Sanitized HTML from the CMS. Sanitization happens on write, in lib/sanitize.ts. */
  html?: string | null;
  /**
   * 'normal' spaces paragraphs apart (bios, descriptions).
   * 'tight'  collapses paragraph margins - for headings and one-line fields.
   * 'inline' also makes paragraphs inline, so several fields flow as one line
   *          (the hero title + subtitle).
   */
  spacing?: 'normal' | 'tight' | 'inline';
  /**
   * Colours for the marks the CMS hardcodes. Default to the light-theme tokens,
   * so existing callers are unchanged; a dark template overrides them so bold
   * text and headings don't render near-invisible on a dark background.
   */
  headingColor?: string;
  strongColor?: string;
  linkColor?: string;
}

/**
 * Renders CMS rich text on the public site.
 *
 * Deliberately sets no font-size or font-family of its own: size comes from the
 * `textStyle` passed by the caller, so unstyled content looks exactly as it did
 * before the CMS, and any inline style the editor emits wins by cascade. Never
 * add `!important` here or the font controls silently stop working.
 */
export function RichText({
  html,
  spacing = 'normal',
  headingColor = 'text.primary',
  strongColor = 'text.primary',
  linkColor = 'accent.brand',
  ...rest
}: RichTextProps) {
  if (!html) return null;

  const paragraphGap = spacing === 'normal' ? '1.5rem' : 0;

  return (
    <Box
      // A <div> is not valid inside an <h1>; inline usage renders a span.
      as={spacing === 'inline' ? 'span' : undefined}
      display={spacing === 'inline' ? 'inline' : undefined}
      {...rest}
      dangerouslySetInnerHTML={{ __html: html }}
      css={{
        '& p': {
          display: spacing === 'inline' ? 'inline' : undefined,
          marginBottom: paragraphGap,
          lineHeight: 'inherit',
        },
        '& p:last-child': {
          marginBottom: 0,
        },
        '& strong, & b': {
          fontWeight: 800,
          color: strongColor,
        },
        // An explicit editor colour must beat the `strong` rule above. TipTap
        // emits the colour span either inside or outside the bold mark
        // depending on which was applied first, so cover both nestings.
        '& strong[style*="color"], & b[style*="color"], & [style*="color"] strong, & [style*="color"] b':
          {
            color: 'inherit',
          },
        '& em, & i': {
          fontStyle: 'italic',
        },
        '& u': {
          textDecoration: 'underline',
        },
        '& s': {
          textDecoration: 'line-through',
        },
        '& h2, & h3, & h4': {
          fontWeight: 800,
          color: headingColor,
          marginBottom: '0.5rem',
          lineHeight: 1.3,
        },
        '& h2': { fontSize: '1.5em' },
        '& h3': { fontSize: '1.25em' },
        '& h4': { fontSize: '1.1em' },
        '& ul, & ol': {
          paddingLeft: '1.25rem',
          marginBottom: paragraphGap,
        },
        '& ul': { listStyleType: 'disc' },
        '& ol': { listStyleType: 'decimal' },
        '& li': { marginBottom: '0.35rem' },
        '& a': {
          textDecoration: 'underline',
          color: linkColor,
        },
        '& a[style*="color"], & [style*="color"] a': {
          color: 'inherit',
        },
      }}
    />
  );
}
