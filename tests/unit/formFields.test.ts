import { describe, it, expect } from 'vitest';
import {
  rich,
  plain,
  nullable,
  bool,
  number,
  stringArray,
} from '@/lib/formFields';

function form(entries: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(entries)) fd.append(k, v);
  return fd;
}

describe('plain', () => {
  it('trims the value', () => {
    expect(plain(form({ a: '  hi  ' }), 'a')).toBe('hi');
  });

  it('returns an empty string for a missing key', () => {
    expect(plain(form({}), 'missing')).toBe('');
  });
});

describe('nullable', () => {
  it('returns the trimmed value when present', () => {
    expect(nullable(form({ a: ' hi ' }), 'a')).toBe('hi');
  });

  it('returns null for an empty or whitespace-only value', () => {
    expect(nullable(form({ a: '' }), 'a')).toBeNull();
    expect(nullable(form({ a: '   ' }), 'a')).toBeNull();
  });

  it('returns null for a missing key', () => {
    expect(nullable(form({}), 'missing')).toBeNull();
  });
});

describe('bool', () => {
  it.each(['true', 'on', '1'])('treats %p as true', (value) => {
    expect(bool(form({ a: value }), 'a')).toBe(true);
  });

  it.each(['false', '0', 'off', 'yes', ''])('treats %p as false', (value) => {
    expect(bool(form({ a: value }), 'a')).toBe(false);
  });

  it('defaults to false when the key is missing', () => {
    expect(bool(form({}), 'missing')).toBe(false);
  });
});

describe('number', () => {
  it('parses an integer', () => {
    expect(number(form({ a: '42' }), 'a')).toBe(42);
  });

  it('parses a negative and a decimal', () => {
    expect(number(form({ a: '-3' }), 'a')).toBe(-3);
    expect(number(form({ a: '2.5' }), 'a')).toBe(2.5);
  });

  it('falls back when unparseable', () => {
    expect(number(form({ a: 'abc' }), 'a', 7)).toBe(7);
  });

  it('falls back when the key is missing', () => {
    expect(number(form({}), 'missing', 9)).toBe(9);
  });

  it('defaults the fallback to 0', () => {
    expect(number(form({ a: 'abc' }), 'a')).toBe(0);
  });
});

describe('stringArray', () => {
  it('parses a JSON array', () => {
    expect(stringArray(form({ a: '["x","y"]' }), 'a')).toEqual(['x', 'y']);
  });

  it('trims entries and drops empty ones', () => {
    expect(stringArray(form({ a: '["  x  ","","  "]' }), 'a')).toEqual(['x']);
  });

  it('returns an empty array for malformed JSON rather than throwing', () => {
    expect(stringArray(form({ a: 'not json' }), 'a')).toEqual([]);
  });

  it('returns an empty array when the JSON is not an array', () => {
    expect(stringArray(form({ a: '{"x":1}' }), 'a')).toEqual([]);
  });

  it('returns an empty array for a missing key', () => {
    expect(stringArray(form({}), 'missing')).toEqual([]);
  });
});

describe('rich', () => {
  it('sanitises on the way in', () => {
    const out = rich(form({ a: '<p>ok</p><script>alert(1)</script>' }), 'a');
    expect(out).toBe('<p>ok</p>');
  });

  it('returns an empty string for a missing key', () => {
    expect(rich(form({}), 'missing')).toBe('');
  });
});
