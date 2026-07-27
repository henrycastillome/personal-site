import { Box } from '@chakra-ui/react';

/**
 * One homepage section.
 *
 * Mirrors the admin shell's container: outer padding on the full-width band,
 * inner `maxW` + `mx="auto"` so content stays measured on wide screens.
 */
export const PAGE_MAX_WIDTH = '1200px';

type Spacing = string | Record<string, string>;

/**
 * The system builds depth by colour blocking rather than shadow. We use the
 * light half of that rhythm only: white alternating with Frost.
 *
 * Near-black bands were tried and removed. The card-heavy sections need a
 * light surface underneath them - on midnight, white cards and white badge
 * pills either glare or disappear, and a charcoal card on a midnight band sits
 * about 1.1:1 apart, so the cards lose their edges. Frost keeps the banding
 * legible at every level.
 */
type Surface = 'white' | 'frost';

const SURFACE_BG: Record<Surface, string> = {
  white: 'bg.primary',
  frost: 'bg.secondary',
};

interface PageSectionProps {
  id: string;
  children: React.ReactNode;
  /** Landing needs extra top padding to clear the fixed mobile menu. */
  pt?: Spacing;
  pb?: Spacing;
  surface?: Surface;
}

export function PageSection({
  id,
  children,
  pt = '20',
  pb = '20',
  surface = 'white',
}: PageSectionProps) {
  return (
    <Box
      as="section"
      id={id}
      pt={pt}
      pb={pb}
      px={{ base: '6', md: '10', lg: '12' }}
      bg={SURFACE_BG[surface]}
      // Clears the sticky nav so a jumped-to heading is not hidden under it.
      scrollMarginTop="88px"
    >
      <Box maxW={PAGE_MAX_WIDTH} mx="auto" w="full">
        {children}
      </Box>
    </Box>
  );
}
