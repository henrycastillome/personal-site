'use client';

import { Box, Flex, Text } from '@chakra-ui/react';
import { LuFrame, LuType, LuHash, LuBriefcase, LuMail, LuSquare, LuMousePointer2, LuHand } from 'react-icons/lu';
import { LandingSection } from '@/components/sections/LandingSection';
import { ProjectsSection } from '@/components/sections/ProjectsSection';
import { BackgroundSection } from '@/components/sections/BackgroundSection';
import { AboutMeSection } from '@/components/sections/AboutMeSection';
import { ContactSection } from '@/components/sections/ContactSection';
import { LiveLayer } from '@/components/live/LiveLayer';
import type { PortfolioData } from '@/templates/types';

/* Figma-flavoured chrome palette — local to this template, not the global theme. */
const CHROME = '#2c2c2c';
const CHROME_BORDER = '#1a1a1a';
const PANEL_TEXT = '#c7c7c7';
const CANVAS = '#e5e5e5';
const BLUE = '#0d99ff';
const FRAME_LABEL = '#9747ff';

/** A titled Figma frame: a purple layer label over a white card of content. */
function Frame({
  id,
  name,
  dim,
  children,
}: {
  id?: string;
  name: string;
  dim?: string;
  children: React.ReactNode;
}) {
  return (
    <Box id={id} scrollMarginTop="24px">
      <Flex align="center" gap="1" mb="2" color={FRAME_LABEL} fontSize="12px" fontWeight="600">
        <LuFrame size={12} />
        <Text>{name}</Text>
        {dim && <Text color="#b08cff" fontWeight="400">· {dim}</Text>}
      </Flex>
      {/* The content is the real Classic section, so the design matches the
          Classic template exactly; the frame just supplies the Figma chrome. */}
      <Box bg="bg.primary" borderRadius="6px" boxShadow="0 4px 16px rgba(0,0,0,0.10)" overflow="hidden" px={{ base: '6', md: '10' }} py={{ base: '8', md: '12' }}>
        {children}
      </Box>
    </Box>
  );
}

function LayerRow({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <Flex
      as={onClick ? 'button' : 'div'}
      onClick={onClick}
      align="center"
      gap="2"
      w="full"
      textAlign="left"
      px="3"
      py="1.5"
      fontSize="12px"
      color={active ? 'white' : PANEL_TEXT}
      bg={active ? 'rgba(13,153,255,0.18)' : 'transparent'}
      _hover={{ bg: 'rgba(255,255,255,0.06)' }}
      cursor={onClick ? 'pointer' : 'default'}
    >
      <Box color={active ? BLUE : '#8a8a8a'}>{icon}</Box>
      <Text truncate>{label}</Text>
    </Flex>
  );
}

export function FigmaTemplate({ data }: { data: PortfolioData }) {
  const { hero, about, projects, workHistory, contact, settings } = data;

  const scrollToFrame = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <LiveLayer room="figma">
      <Flex direction="column" h="100vh" bg={CANVAS} overflow="hidden">
        {/* Toolbar */}
        <Flex
          align="center"
          h="48px"
          flexShrink={0}
          bg={CHROME}
          borderBottomWidth="1px"
          borderColor={CHROME_BORDER}
          px="3"
          gap="2"
          color="white"
        >
          <Flex align="center" justify="center" w="32px" h="32px" borderRadius="4px" _hover={{ bg: 'rgba(255,255,255,0.08)' }}>
            <Box w="14px" h="14px" borderRadius="3px" bg="#a259ff" />
          </Flex>
          <Flex align="center" gap="1" color={PANEL_TEXT}>
            {[LuMousePointer2, LuFrame, LuSquare, LuType, LuHand].map((Icon, i) => (
              <Flex key={i} align="center" justify="center" w="30px" h="30px" borderRadius="4px"
                bg={i === 0 ? 'rgba(13,153,255,0.25)' : 'transparent'}
                color={i === 0 ? BLUE : PANEL_TEXT}
                _hover={{ bg: 'rgba(255,255,255,0.08)' }}>
                <Icon size={15} />
              </Flex>
            ))}
          </Flex>
          <Flex flex="1" justify="center" align="center" gap="1" fontSize="13px" color="#e0e0e0">
            <Text fontWeight="500">henry-melo</Text>
            <Text color="#8a8a8a">.fig</Text>
          </Flex>
          {/* Space kept clear on the right for the live presence stack */}
          <Flex align="center" gap="2" pr="150px">
            <Box bg={BLUE} color="white" fontSize="13px" fontWeight="600" borderRadius="6px" px="3" py="1.5">
              Share
            </Box>
          </Flex>
        </Flex>

        {/* Body */}
        <Flex flex="1" minH="0">
          {/* Left layers panel */}
          <Box w="240px" flexShrink={0} bg={CHROME} borderRightWidth="1px" borderColor={CHROME_BORDER} py="2" display={{ base: 'none', md: 'block' }} overflowY="auto">
            <Text px="3" py="1" fontSize="11px" fontWeight="700" color="#8a8a8a" textTransform="uppercase" letterSpacing="wide">
              Pages
            </Text>
            <LayerRow icon={<LuFrame size={13} />} label="Portfolio" active onClick={() => scrollToFrame('frame-hero')} />
            <Text px="3" pt="3" py="1" fontSize="11px" fontWeight="700" color="#8a8a8a" textTransform="uppercase" letterSpacing="wide">
              Layers
            </Text>
            <LayerRow icon={<LuFrame size={13} />} label="Hero" onClick={() => scrollToFrame('frame-hero')} />
            <LayerRow icon={<LuHash size={13} />} label="Projects" onClick={() => scrollToFrame('frame-projects')} />
            <LayerRow icon={<LuBriefcase size={13} />} label="Experience" onClick={() => scrollToFrame('frame-experience')} />
            <LayerRow icon={<LuType size={13} />} label="About" onClick={() => scrollToFrame('frame-about')} />
            <LayerRow icon={<LuMail size={13} />} label="Contact" onClick={() => scrollToFrame('frame-contact')} />
          </Box>

          {/* Canvas */}
          <Box
            flex="1"
            minW="0"
            overflowY="auto"
            bg={CANVAS}
            backgroundImage="radial-gradient(#cfcfcf 1px, transparent 1px)"
            backgroundSize="20px 20px"
            px={{ base: '5', md: '16' }}
            py={{ base: '8', md: '14' }}
          >
            <Flex direction="column" gap="14" maxW="960px" mx="auto">
              {hero && (
                <Frame id="frame-hero" name="Hero" dim="1440 × 900">
                  <LandingSection
                    content={hero}
                    contactEmail={contact?.email}
                    linkedinUrl={contact?.linkedin_url}
                  />
                </Frame>
              )}

              {projects.length > 0 && (
                <Frame id="frame-projects" name="Projects" dim="Grid">
                  <ProjectsSection projects={projects} heading={settings?.projects_heading} />
                </Frame>
              )}

              {workHistory.length > 0 && (
                <Frame id="frame-experience" name="Experience" dim="Timeline">
                  <BackgroundSection workHistory={workHistory} heading={settings?.background_heading} />
                </Frame>
              )}

              {about && (
                <Frame id="frame-about" name="About">
                  <AboutMeSection content={about} />
                </Frame>
              )}

              {contact && (
                <Frame id="frame-contact" name="Contact">
                  <ContactSection content={contact} />
                </Frame>
              )}
            </Flex>
          </Box>

          {/* Right properties panel (decorative) */}
          <Box w="240px" flexShrink={0} bg={CHROME} borderLeftWidth="1px" borderColor={CHROME_BORDER} p="3" display={{ base: 'none', lg: 'block' }} color={PANEL_TEXT}>
            <Text fontSize="11px" fontWeight="700" color="#8a8a8a" textTransform="uppercase" letterSpacing="wide" mb="3">
              Design
            </Text>
            {[
              ['Position', 'Auto'],
              ['Width', '960'],
              ['Fill', 'Deep Teal'],
              ['Font', 'Inter'],
            ].map(([k, v]) => (
              <Flex key={k} justify="space-between" fontSize="12px" py="1.5" borderBottomWidth="1px" borderColor="rgba(255,255,255,0.06)">
                <Text color="#8a8a8a">{k}</Text>
                <Text color="#d0d0d0">{v}</Text>
              </Flex>
            ))}
          </Box>
        </Flex>
      </Flex>
    </LiveLayer>
  );
}
