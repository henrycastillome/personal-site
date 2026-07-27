'use client';

import { useState } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { ChakraProvider } from '@chakra-ui/react';
import { system } from '@/theme';

/**
 * Chakra + Emotion, wired for the App Router.
 *
 * Emotion knows nothing about React Server Components: left alone it injects
 * <style> tags into the markup as it renders on the server, then inserts the
 * same styles into <head> on the client. The two trees disagree and React
 * reports
 *
 *   "Hydration failed because the server rendered HTML didn't match the client"
 *
 * pointing at a `<style data-emotion="css-global ...">` where a `<div>` was
 * expected.
 *
 * `useServerInsertedHTML` is the App Router's hook for exactly this: whatever
 * Emotion inserted during a server render is collected and flushed into <head>
 * so both sides see the same tree.
 *
 * The hook fires once per streaming flush, not once per render, so it has to
 * emit only what is new since the previous call. Writing out the whole cache
 * each time repeats every rule on every flush - that shipped a 1.4 MB homepage
 * with 13 identical copies of the stylesheet. Wrapping `cache.insert` to record
 * newly-inserted names, then draining that list per flush, keeps each rule in
 * the document exactly once.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [{ cache, flush }] = useState(() => {
    const emotionCache = createCache({ key: 'css' });
    // Stops Emotion emitting its own inline <style> tags as it renders, which
    // is what produced the mismatched nodes.
    emotionCache.compat = true;

    const prevInsert = emotionCache.insert.bind(emotionCache);
    let pending: string[] = [];

    emotionCache.insert = (...args: Parameters<typeof prevInsert>) => {
      const serialized = args[1];
      // Only track first insertion; Emotion re-inserts known names harmlessly.
      if (emotionCache.inserted[serialized.name] === undefined) {
        pending.push(serialized.name);
      }
      return prevInsert(...args);
    };

    const drain = () => {
      const names = pending;
      pending = [];
      return names;
    };

    return { cache: emotionCache, flush: drain };
  });

  useServerInsertedHTML(() => {
    const names = flush();
    if (names.length === 0) return null;

    let styles = '';
    for (const name of names) {
      const rule = cache.inserted[name];
      // Emotion stores `true` rather than a string for already-flushed names.
      if (typeof rule === 'string') styles += rule;
    }

    return (
      <style
        data-emotion={`${cache.key} ${names.join(' ')}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return (
    <CacheProvider value={cache}>
      <ChakraProvider value={system}>{children}</ChakraProvider>
    </CacheProvider>
  );
}
