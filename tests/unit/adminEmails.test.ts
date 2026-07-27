import { describe, it, expect, afterEach } from 'vitest';
import { adminEmails, isAdminEmail } from '@/lib/auth/adminEmails';

/**
 * The allowlist is the authorization boundary for the whole CMS - every server
 * action ultimately depends on it. The failure that matters most is failing
 * *open*, so that is asserted explicitly.
 */
const ORIGINAL = process.env.ADMIN_EMAIL;

function setAllowlist(value: string | undefined) {
  if (value === undefined) delete process.env.ADMIN_EMAIL;
  else process.env.ADMIN_EMAIL = value;
}

afterEach(() => setAllowlist(ORIGINAL));

describe('adminEmails', () => {
  it('parses a comma-separated list', () => {
    setAllowlist('a@example.com,b@example.com');
    expect(adminEmails()).toEqual(['a@example.com', 'b@example.com']);
  });

  it('trims whitespace and lowercases', () => {
    setAllowlist('  A@Example.COM , B@example.com  ');
    expect(adminEmails()).toEqual(['a@example.com', 'b@example.com']);
  });

  it('ignores empty entries from trailing or doubled commas', () => {
    setAllowlist('a@example.com,,b@example.com,');
    expect(adminEmails()).toEqual(['a@example.com', 'b@example.com']);
  });

  it('returns an empty list when unset', () => {
    setAllowlist(undefined);
    expect(adminEmails()).toEqual([]);
  });
});

describe('isAdminEmail', () => {
  describe('accepts allow-listed addresses', () => {
    it('matches a single-value allowlist', () => {
      setAllowlist('a@example.com');
      expect(isAdminEmail('a@example.com')).toBe(true);
    });

    it('matches any entry in a list', () => {
      setAllowlist('a@example.com,b@example.com');
      expect(isAdminEmail('b@example.com')).toBe(true);
    });

    it('is case-insensitive and tolerant of surrounding whitespace', () => {
      setAllowlist('a@example.com');
      expect(isAdminEmail('  A@Example.COM  ')).toBe(true);
    });
  });

  describe('rejects everything else', () => {
    it('rejects an address that is not listed', () => {
      setAllowlist('a@example.com');
      expect(isAdminEmail('someone@else.com')).toBe(false);
    });

    it('rejects a look-alike domain suffix', () => {
      setAllowlist('a@example.com');
      expect(isAdminEmail('a@example.com.evil.com')).toBe(false);
    });

    it('rejects a substring of an allowed address', () => {
      setAllowlist('admin@example.com');
      expect(isAdminEmail('min@example.com')).toBe(false);
    });

    it('rejects the whole list passed as one address', () => {
      setAllowlist('a@example.com,b@example.com');
      expect(isAdminEmail('a@example.com,b@example.com')).toBe(false);
    });

    it.each([undefined, null, ''])('rejects %p', (input) => {
      setAllowlist('a@example.com');
      expect(isAdminEmail(input)).toBe(false);
    });
  });

  describe('fails closed', () => {
    it('rejects everyone when ADMIN_EMAIL is unset', () => {
      setAllowlist(undefined);
      expect(isAdminEmail('a@example.com')).toBe(false);
    });

    it('rejects everyone when ADMIN_EMAIL is empty', () => {
      setAllowlist('');
      expect(isAdminEmail('a@example.com')).toBe(false);
    });

    it('rejects everyone when ADMIN_EMAIL is only separators', () => {
      setAllowlist(' , , ');
      expect(isAdminEmail('a@example.com')).toBe(false);
    });
  });
});
