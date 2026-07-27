import sanitizeHtml from 'sanitize-html';

/**
 * HTML sanitising for CMS rich text.
 *
 * Backed by sanitize-html (htmlparser2) rather than DOMPurify on purpose.
 * DOMPurify needs a DOM, so on the server it pulls in jsdom - which traced
 * **637 files** into the homepage's serverless bundle and broke the deployed
 * function. sanitize-html is pure JS and needs no DOM at all.
 *
 * The behaviour contract is defined by tests/unit/sanitize.test.ts.
 */

/**
 * Style properties the editor is allowed to emit. Anything else (position,
 * background-image, ...) is dropped so stored content cannot break the layout.
 *
 * The patterns also reject `url(...)` and `expression(...)` payloads: each
 * value is matched against an allowlist regex rather than merely checked for
 * a forbidden substring.
 */
const ALLOWED_STYLES = {
  '*': {
    'font-size': [/^\d+(\.\d+)?(px|em|rem|%|pt)$/i],
    'font-family': [/^[\w\s'",-]+$/],
    color: [/^#[0-9a-f]{3,8}$/i, /^rgba?\([\d\s.,%]+\)$/i, /^[a-z]+$/i],
    'text-align': [/^(left|right|center|justify)$/i],
    'font-weight': [/^(normal|bold|lighter|bolder|[1-9]00)$/i],
    'font-style': [/^(normal|italic|oblique)$/i],
  },
};

const ALLOWED_TAGS = [
  'p',
  'br',
  'span',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'h2',
  'h3',
  'h4',
  'ul',
  'ol',
  'li',
  'a',
];

/**
 * Sanitises rich text HTML produced by the admin editor.
 *
 * Applied both on write (so what lands in the database is already safe) and on
 * read (see lib/sanitizeContent.ts), because writing is not the only way
 * content reaches these tables.
 */
export function sanitizeRichText(html: string | null | undefined): string {
  if (!html) return '';

  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      '*': ['style'],
    },
    allowedStyles: ALLOWED_STYLES,
    // Anything else - notably javascript: - is dropped along with the attribute.
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesAppliedToAttributes: ['href'],
    transformTags: {
      // Links open in a new tab, so they must carry the opener guard.
      a: (tagName, attribs) => ({
        tagName,
        attribs: attribs.href
          ? { ...attribs, target: '_blank', rel: 'noopener noreferrer' }
          : attribs,
      }),
    },
    // Keep entities as authored instead of re-encoding them.
    parser: { decodeEntities: false },
  });
}

/**
 * Strips all markup - for fields that feed plain-text contexts such as image
 * alt text, <title>, and meta descriptions.
 */
export function toPlainText(html: string | null | undefined): string {
  if (!html) return '';

  const stripped = sanitizeHtml(html, {
    allowedTags: [],
    allowedAttributes: {},
    // Without this, the *contents* of a <script> would survive as text.
    nonTextTags: ['style', 'script', 'textarea', 'option', 'noscript'],
  });

  return stripped.replace(/\s+/g, ' ').trim();
}
