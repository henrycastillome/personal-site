'use client';

import { useState } from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
import {
  LuFiles, LuSearch, LuGitBranch, LuPlay, LuBlocks, LuSettings,
  LuChevronDown, LuFileCode, LuFileJson, LuFileText,
} from 'react-icons/lu';
import { LiveLayer } from '@/components/live/LiveLayer';
import type { PortfolioData, } from '@/templates/types';
import type { WorkHistory, Project } from '@/lib/types';

/* VS Code (Dark+) palette — local to this template. */
const EDITOR = '#1e1e1e';
const SIDEBAR = '#252526';
const ACTIVITY = '#333333';
const TAB_ACTIVE = '#1e1e1e';
const TAB_BAR = '#2d2d2d';
const STATUS = '#007acc';
const TXT = '#d4d4d4';
const MUTED = '#858585';
const KEY = '#569cd6';
const STR = '#ce9178';
const CMT = '#6a9955';
const NUM = '#b5cea8';
const PROP = '#9cdcfe';

const MONO = "'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace";

function stripHtml(html?: string): string {
  return (html ?? '').replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').trim();
}

type FileId = 'hero.tsx' | 'projects.tsx' | 'experience.ts' | 'about.md' | 'contact.json';

const FILE_META: { id: FileId; icon: React.ReactNode; color: string }[] = [
  { id: 'hero.tsx', icon: <LuFileCode size={15} />, color: '#519aba' },
  { id: 'projects.tsx', icon: <LuFileCode size={15} />, color: '#519aba' },
  { id: 'experience.ts', icon: <LuFileCode size={15} />, color: '#519aba' },
  { id: 'about.md', icon: <LuFileText size={15} />, color: '#519aba' },
  { id: 'contact.json', icon: <LuFileJson size={15} />, color: '#cbcb41' },
];

/** A monospace line with a matching gutter number. */
function Line({ n, children }: { n: number; children?: React.ReactNode }) {
  return (
    <Flex>
      <Box w="48px" flexShrink={0} pr="4" textAlign="right" color={MUTED} userSelect="none">
        {n}
      </Box>
      <Box flex="1" whiteSpace="pre-wrap" wordBreak="break-word">{children}</Box>
    </Flex>
  );
}

function heroDoc(data: PortfolioData): React.ReactNode[] {
  const h = data.hero;
  return [
    <><Text as="span" color={CMT}>{'// Hero section'}</Text></>,
    <><Text as="span" color={KEY}>export const</Text>{' '}<Text as="span" color={PROP}>hero</Text>{' = {'}</>,
    <>{'  '}<Text as="span" color={PROP}>greeting</Text>{': '}<Text as="span" color={STR}>{`'${stripHtml(h?.greeting) || "Hi, I'm Henry"}'`}</Text>{','}</>,
    <>{'  '}<Text as="span" color={PROP}>headline</Text>{': '}<Text as="span" color={STR}>{`'${stripHtml(h?.subtitle) || stripHtml(h?.title)}'`}</Text>{','}</>,
    <>{'  '}<Text as="span" color={PROP}>intro</Text>{': '}<Text as="span" color={STR}>{`'${stripHtml(h?.description)}'`}</Text>{','}</>,
    <>{'}'}</>,
  ];
}

function projectsDoc(projects: Project[]): React.ReactNode[] {
  const lines: React.ReactNode[] = [
    <><Text as="span" color={CMT}>{'// Selected work'}</Text></>,
    <><Text as="span" color={KEY}>export const</Text>{' '}<Text as="span" color={PROP}>projects</Text>{' = ['}</>,
  ];
  projects.forEach((p) => {
    lines.push(<>{'  { '}<Text as="span" color={PROP}>title</Text>{': '}<Text as="span" color={STR}>{`'${stripHtml(p.title)}'`}</Text>{',' }</>);
    if (p.short_description) lines.push(<>{'    '}<Text as="span" color={PROP}>summary</Text>{': '}<Text as="span" color={STR}>{`'${p.short_description}'`}</Text>{',' }</>);
    if (p.technologies?.length) lines.push(<>{'    '}<Text as="span" color={PROP}>stack</Text>{': ['}<Text as="span" color={STR}>{p.technologies.map((t) => `'${t}'`).join(', ')}</Text>{'] },'}</>);
    else lines.push(<>{'  },'}</>);
  });
  lines.push(<>{']'}</>);
  return lines;
}

function experienceDoc(work: WorkHistory[]): React.ReactNode[] {
  const lines: React.ReactNode[] = [
    <><Text as="span" color={CMT}>{'// Career timeline'}</Text></>,
    <><Text as="span" color={KEY}>export const</Text>{' '}<Text as="span" color={PROP}>experience</Text>{' = ['}</>,
  ];
  work.filter((w) => w.is_visible).forEach((w) => {
    const years = `${w.start_date?.split('-')[0]}–${w.is_current ? 'now' : w.end_date?.split('-')[0] ?? 'now'}`;
    lines.push(
      <>{'  { '}
        <Text as="span" color={PROP}>role</Text>{': '}<Text as="span" color={STR}>{`'${stripHtml(w.position)}'`}</Text>{', '}
        <Text as="span" color={PROP}>at</Text>{': '}<Text as="span" color={STR}>{`'${w.company}'`}</Text>{', '}
        <Text as="span" color={PROP}>years</Text>{': '}<Text as="span" color={NUM}>{`'${years}'`}</Text>{' },'}
      </>
    );
  });
  lines.push(<>{']'}</>);
  return lines;
}

function contactDoc(data: PortfolioData): React.ReactNode[] {
  const c = data.contact;
  return [
    <>{'{'}</>,
    <>{'  '}<Text as="span" color={PROP}>&quot;email&quot;</Text>{': '}<Text as="span" color={STR}>{`"${c?.email ?? ''}"`}</Text>{','}</>,
    <>{'  '}<Text as="span" color={PROP}>&quot;linkedin&quot;</Text>{': '}<Text as="span" color={STR}>{`"${c?.linkedin_url ?? ''}"`}</Text>{','}</>,
    <>{'  '}<Text as="span" color={PROP}>&quot;github&quot;</Text>{': '}<Text as="span" color={STR}>{`"${c?.github_url ?? ''}"`}</Text>{','}</>,
    <>{'  '}<Text as="span" color={PROP}>&quot;location&quot;</Text>{': '}<Text as="span" color={STR}>{`"${c?.location ?? ''}"`}</Text></>,
    <>{'}'}</>,
  ];
}

function aboutDoc(data: PortfolioData): React.ReactNode[] {
  const bio = stripHtml(data.about?.bio);
  const paras = bio.split(/\n+/).filter(Boolean);
  const lines: React.ReactNode[] = [<><Text as="span" color={KEY}># About</Text></>, <>{' '}</>];
  paras.forEach((p) => { lines.push(<Text as="span" color={TXT}>{p}</Text>); lines.push(<>{' '}</>); });
  return lines;
}

export function VsCodeTemplate({ data }: { data: PortfolioData }) {
  const [active, setActive] = useState<FileId>('hero.tsx');
  const [open] = useState<FileId[]>(['hero.tsx', 'projects.tsx', 'experience.ts', 'about.md', 'contact.json']);

  const docFor = (id: FileId): React.ReactNode[] => {
    switch (id) {
      case 'hero.tsx': return heroDoc(data);
      case 'projects.tsx': return projectsDoc(data.projects);
      case 'experience.ts': return experienceDoc(data.workHistory);
      case 'about.md': return aboutDoc(data);
      case 'contact.json': return contactDoc(data);
    }
  };
  const lines = docFor(active);

  return (
    <LiveLayer room="vscode">
      <Flex direction="column" h="100vh" bg={EDITOR} overflow="hidden" color={TXT} fontFamily="Inter, sans-serif">
        {/* Title bar */}
        <Flex align="center" justify="center" h="30px" flexShrink={0} bg="#3c3c3c" fontSize="12px" color="#cccccc">
          henry-melo — Visual Studio Code
        </Flex>

        <Flex flex="1" minH="0">
          {/* Activity bar */}
          <Flex direction="column" align="center" w="48px" flexShrink={0} bg={ACTIVITY} py="2" gap="1" color="#858585">
            {[LuFiles, LuSearch, LuGitBranch, LuPlay, LuBlocks].map((Icon, i) => (
              <Flex key={i} align="center" justify="center" w="48px" h="40px"
                color={i === 0 ? 'white' : '#858585'}
                borderLeftWidth="2px" borderColor={i === 0 ? 'white' : 'transparent'}>
                <Icon size={22} />
              </Flex>
            ))}
            <Box flex="1" />
            <Flex align="center" justify="center" w="48px" h="40px"><LuSettings size={22} /></Flex>
          </Flex>

          {/* Explorer */}
          <Box w="240px" flexShrink={0} bg={SIDEBAR} display={{ base: 'none', md: 'block' }} overflowY="auto">
            <Text px="4" py="2" fontSize="11px" color="#bbbbbb" textTransform="uppercase" letterSpacing="wide">
              Explorer
            </Text>
            <Flex align="center" gap="1" px="2" py="1" fontSize="12px" fontWeight="700" color="#cccccc">
              <LuChevronDown size={14} /> henry-melo
            </Flex>
            {FILE_META.map((f) => (
              <Flex
                key={f.id}
                as="button"
                onClick={() => setActive(f.id)}
                align="center"
                gap="2"
                w="full"
                pl="7"
                pr="3"
                py="1"
                fontSize="13px"
                textAlign="left"
                color={active === f.id ? 'white' : '#cccccc'}
                bg={active === f.id ? 'rgba(255,255,255,0.08)' : 'transparent'}
                _hover={{ bg: 'rgba(255,255,255,0.04)' }}
              >
                <Box color={f.color}>{f.icon}</Box>
                <Text>{f.id}</Text>
              </Flex>
            ))}
          </Box>

          {/* Editor */}
          <Flex direction="column" flex="1" minW="0" bg={EDITOR}>
            {/* Tabs */}
            <Flex bg={TAB_BAR} flexShrink={0} overflowX="auto">
              {open.map((id) => (
                <Flex
                  key={id}
                  as="button"
                  onClick={() => setActive(id)}
                  align="center"
                  gap="2"
                  px="3"
                  py="2"
                  fontSize="13px"
                  flexShrink={0}
                  bg={active === id ? TAB_ACTIVE : 'transparent'}
                  color={active === id ? 'white' : '#969696'}
                  borderTopWidth="1px"
                  borderColor={active === id ? STATUS : 'transparent'}
                  borderRightWidth="1px"
                  borderRightColor="#252526"
                >
                  <Box color={FILE_META.find((f) => f.id === id)?.color}>
                    {FILE_META.find((f) => f.id === id)?.icon}
                  </Box>
                  {id}
                </Flex>
              ))}
            </Flex>

            {/* Breadcrumb */}
            <Flex align="center" gap="1" px="4" py="1" fontSize="12px" color={MUTED} flexShrink={0}>
              henry-melo <Text color="#555">›</Text> {active}
            </Flex>

            {/* Code area */}
            <Box flex="1" overflowY="auto" px="3" py="2" fontFamily={MONO} fontSize="13px" lineHeight="1.6">
              {lines.map((ln, i) => (
                <Line key={i} n={i + 1}>{ln}</Line>
              ))}
            </Box>
          </Flex>
        </Flex>

        {/* Status bar */}
        <Flex align="center" h="22px" flexShrink={0} bg={STATUS} color="white" fontSize="12px" px="3" gap="3">
          <Flex align="center" gap="1"><LuGitBranch size={13} /> main</Flex>
          <Text>Ln 1, Col 1</Text>
          <Box flex="1" />
          <Text>{active.endsWith('.tsx') ? 'TypeScript React' : active.endsWith('.ts') ? 'TypeScript' : active.endsWith('.json') ? 'JSON' : 'Markdown'}</Text>
          <Text>UTF-8</Text>
        </Flex>
      </Flex>
    </LiveLayer>
  );
}
