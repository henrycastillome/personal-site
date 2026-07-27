import { defineTokens } from '@chakra-ui/react';

export const durations = defineTokens.durations({
  fast: { value: '150ms' },
  normal: { value: '200ms' },
  slow: { value: '300ms' },
  slower: { value: '500ms' },
});

export const easings = defineTokens.easings({
  easeIn: { value: 'cubic-bezier(0.4, 0, 1, 1)' },
  easeOut: { value: 'cubic-bezier(0, 0, 0.2, 1)' },
  easeInOut: { value: 'cubic-bezier(0.4, 0, 0.2, 1)' },
});

/**
 * Ready-made `transition` shorthands. Not Chakra tokens - imported directly by
 * recipes, the way snap&go's button recipe consumes them.
 */
export const transitions = {
  fast: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
  normal: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
};
