/**
 * Classifying a visit from the user-agent, server-side.
 *
 * Deliberately coarse - three buckets, good enough for "how many people are on
 * their phone" without fingerprinting. Read from the request's user-agent
 * header, never from anything the client sends in the body.
 */

export type Device = 'mobile' | 'tablet' | 'desktop';

// Tablet must be tested before mobile: Android tablets omit "Mobile" from the
// UA while Android phones include it, so the negative lookahead disambiguates.
const TABLET = /ipad|tablet|kindle|playbook|silk|(android(?!.*mobile))/i;
const MOBILE = /mobi|iphone|ipod|blackberry|opera mini|iemobile|(android.*mobile)/i;

export function deviceFromUserAgent(ua: string | null | undefined): Device {
  if (!ua) return 'desktop';
  if (TABLET.test(ua)) return 'tablet';
  if (MOBILE.test(ua)) return 'mobile';
  return 'desktop';
}

// Non-exhaustive by nature; catches the common crawlers and link-preview bots
// so they do not inflate the counts. Real browsers never match these.
const BOT =
  /bot\b|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|quora link|pinterest|vkshare|whatsapp|telegram|headless|lighthouse|pingdom|gtmetrix|monitor|preview|scrapy|curl|wget|python-requests|axios|node-fetch/i;

/**
 * A visit worth ignoring. Beacon-based collection already sheds most bots
 * (they do not run JS), so this is a second, lightweight filter. Missing UA
 * counts as a bot: a real browser always sends one.
 */
export function isBot(ua: string | null | undefined): boolean {
  if (!ua) return true;
  return BOT.test(ua);
}
