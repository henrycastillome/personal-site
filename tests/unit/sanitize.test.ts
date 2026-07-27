import { describe, it, expect } from 'vitest';
import { sanitizeRichText, toPlainText } from '@/lib/sanitize';

/**
 * The security-critical suite.
 *
 * Every rich-text field in the CMS is rendered with dangerouslySetInnerHTML,
 * so this function is the thing standing between stored content and script
 * execution. The cases below mirror the manual checks run when it was written.
 */
describe('sanitizeRichText', () => {
  describe('strips dangerous content', () => {
    it('removes script tags entirely', () => {
      const out = sanitizeRichText('<p>ok</p><script>alert(1)</script>');
      expect(out).toBe('<p>ok</p>');
      expect(out).not.toContain('script');
    });

    it('removes img tags and their event handlers', () => {
      const out = sanitizeRichText('<p><img src=x onerror=alert(1)></p>');
      expect(out).not.toContain('onerror');
      expect(out).not.toContain('<img');
    });

    it('strips javascript: hrefs but keeps the link text', () => {
      const out = sanitizeRichText('<p><a href="javascript:alert(1)">click</a></p>');
      expect(out).not.toContain('javascript:');
      expect(out).toContain('click');
    });

    it('removes inline event handlers from allowed tags', () => {
      const out = sanitizeRichText('<p onclick="alert(1)">text</p>');
      expect(out).not.toContain('onclick');
      expect(out).toContain('text');
    });

    it('drops iframes and objects', () => {
      expect(sanitizeRichText('<iframe src="evil"></iframe>')).not.toContain('iframe');
      expect(sanitizeRichText('<object data="evil"></object>')).not.toContain('object');
    });
  });

  describe('style attribute filtering', () => {
    it('keeps the typographic properties the editor produces', () => {
      const out = sanitizeRichText(
        '<p><span style="font-size: 56px; color: #107c7c">x</span></p>'
      );
      expect(out).toContain('font-size');
      expect(out).toContain('color');
    });

    it('keeps font-family with quoted values', () => {
      const out = sanitizeRichText(
        `<p><span style="font-family: Georgia, 'Times New Roman', serif">x</span></p>`
      );
      expect(out).toContain('font-family');
    });

    it('drops layout-breaking properties but keeps allowed ones alongside', () => {
      const out = sanitizeRichText(
        '<p><span style="position:fixed;background-image:url(javascript:alert(1));font-size:20px">x</span></p>'
      );
      expect(out).not.toContain('position');
      expect(out).not.toContain('background-image');
      expect(out).toContain('font-size:20px');
    });

    it('rejects url() and expression() in otherwise allowed properties', () => {
      const out = sanitizeRichText(
        '<p><span style="color: url(javascript:alert(1))">x</span></p>'
      );
      expect(out).not.toContain('url(');
    });

    it('keeps text-align', () => {
      expect(sanitizeRichText('<p style="text-align: center">x</p>')).toContain(
        'text-align'
      );
    });
  });

  describe('preserves legitimate content', () => {
    it('keeps formatting tags the editor emits', () => {
      const html =
        '<p><strong>a</strong><em>b</em><u>c</u><s>d</s></p><h2>h</h2><ul><li>i</li></ul>';
      const out = sanitizeRichText(html);
      for (const tag of ['strong', 'em', 'u', 's', 'h2', 'ul', 'li']) {
        expect(out).toContain(`<${tag}`);
      }
    });

    it('keeps http links and hardens them with rel/target', () => {
      const out = sanitizeRichText('<p><a href="https://example.com">x</a></p>');
      expect(out).toContain('href="https://example.com"');
      expect(out).toContain('rel="noopener noreferrer"');
      expect(out).toContain('target="_blank"');
    });

    it('allows mailto links', () => {
      expect(sanitizeRichText('<a href="mailto:a@b.com">x</a>')).toContain('mailto:');
    });

    it('passes plain text through unchanged', () => {
      expect(sanitizeRichText('Henry Melo')).toBe('Henry Melo');
    });

    it('preserves the bold-inside-colour-span nesting TipTap produces', () => {
      const out = sanitizeRichText(
        '<p><strong><span style="color: #107c7c">teal bold</span></strong></p>'
      );
      expect(out).toContain('<strong>');
      expect(out).toContain('color');
    });
  });

  describe('empty input', () => {
    it.each([null, undefined, ''])('returns an empty string for %p', (input) => {
      expect(sanitizeRichText(input)).toBe('');
    });
  });
});

describe('toPlainText', () => {
  it('strips all markup', () => {
    expect(toPlainText('<p>Hello <strong>world</strong></p>')).toBe('Hello world');
  });

  it('collapses whitespace', () => {
    expect(toPlainText('<p>a</p>\n\n   <p>b</p>')).toBe('a b');
  });

  it('removes script content rather than exposing it as text', () => {
    expect(toPlainText('<script>alert(1)</script>')).toBe('');
  });

  it.each([null, undefined, ''])('returns an empty string for %p', (input) => {
    expect(toPlainText(input)).toBe('');
  });
});
