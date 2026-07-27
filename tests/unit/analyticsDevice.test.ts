import { describe, it, expect } from 'vitest';
import { deviceFromUserAgent, isBot } from '@/lib/analytics/device';

/**
 * Device classification drives the mobile/desktop split, and isBot keeps
 * crawlers out of the counts. The tablet-before-mobile ordering is the subtle
 * part: Android phones carry "Mobile" in the UA while Android tablets do not.
 */

const UA = {
  iphone:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  androidPhone:
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36',
  ipad:
    'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/604.1',
  androidTablet:
    'Mozilla/5.0 (Linux; Android 13; SM-X710) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
  desktop:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
  googlebot:
    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
};

describe('deviceFromUserAgent', () => {
  it('classifies phones as mobile', () => {
    expect(deviceFromUserAgent(UA.iphone)).toBe('mobile');
    expect(deviceFromUserAgent(UA.androidPhone)).toBe('mobile');
  });

  it('classifies tablets as tablet', () => {
    expect(deviceFromUserAgent(UA.ipad)).toBe('tablet');
    // The key case: an Android tablet has no "Mobile" token and must NOT fall
    // through to mobile.
    expect(deviceFromUserAgent(UA.androidTablet)).toBe('tablet');
  });

  it('classifies everything else as desktop', () => {
    expect(deviceFromUserAgent(UA.desktop)).toBe('desktop');
    expect(deviceFromUserAgent(null)).toBe('desktop');
    expect(deviceFromUserAgent('')).toBe('desktop');
  });
});

describe('isBot', () => {
  it('flags known crawlers and tools', () => {
    expect(isBot(UA.googlebot)).toBe(true);
    expect(isBot('facebookexternalhit/1.1')).toBe(true);
    expect(isBot('curl/8.4.0')).toBe(true);
    expect(isBot('python-requests/2.31')).toBe(true);
  });

  it('treats a missing user-agent as a bot', () => {
    expect(isBot(null)).toBe(true);
    expect(isBot(undefined)).toBe(true);
    expect(isBot('')).toBe(true);
  });

  it('lets real browsers through', () => {
    expect(isBot(UA.iphone)).toBe(false);
    expect(isBot(UA.desktop)).toBe(false);
    expect(isBot(UA.androidTablet)).toBe(false);
  });
});
