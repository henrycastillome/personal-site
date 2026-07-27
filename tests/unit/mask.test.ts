import { describe, it, expect } from 'vitest';
import { maskEmail, maskPhone } from '@/lib/auth/quota';

/**
 * These feed the sign-in event log (migration 008), which deliberately stores
 * no full identifiers. The masking is the thing that keeps the log free of
 * personal data, so it is worth pinning down precisely.
 */

describe('maskEmail', () => {
  it('keeps the first letter and the whole domain', () => {
    expect(maskEmail('nelson@gmail.com')).toBe('n•••@gmail.com');
  });

  it('never reveals the rest of the local part', () => {
    // Whatever the local part, only its first character survives.
    expect(maskEmail('averylongname@example.org')).toBe('a•••@example.org');
    expect(maskEmail('ab@example.org')).toBe('a•••@example.org');
  });

  it('lowercases and trims first', () => {
    expect(maskEmail('  Henry@Gmail.COM  ')).toBe('h•••@gmail.com');
  });

  it('distinguishes the two admins by first letter + domain', () => {
    // The whole point: telling nelson@ from henry@ in the log.
    expect(maskEmail('nelsonmad3@gmail.com')).not.toBe(
      maskEmail('henrycastillome@gmail.com')
    );
  });

  it('reveals nothing for a value with no local part', () => {
    expect(maskEmail('@gmail.com')).toBe('•••');
  });

  it('reveals nothing for a non-address', () => {
    expect(maskEmail('not-an-email')).toBe('•••');
    expect(maskEmail('')).toBe('•••');
  });

  it('masks against the last @ so a local-part @ cannot leak the domain', () => {
    // lastIndexOf keeps the real domain even with an odd local part.
    expect(maskEmail('a@b@gmail.com')).toBe('a•••@gmail.com');
  });
});

describe('maskPhone', () => {
  it('shows only the last four digits', () => {
    expect(maskPhone('+14155550189')).toBe('••• ••• 0189');
  });

  it('ignores formatting characters', () => {
    expect(maskPhone('+1 (415) 555-0189')).toBe('••• ••• 0189');
  });
});
