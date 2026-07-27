'use client';

import {
  AspectRatio,
  Badge,
  Box,
  Card,
  DataList,
  Flex,
  Grid,
  Image,
  VStack,
} from '@chakra-ui/react';
import { LuArrowDown } from 'react-icons/lu';
import { RichText } from '@/components/ui/RichText';
import type { Project } from '@/lib/types';

interface ProjectsSectionProps {
  projects: Project[];
  /** Rich-text section heading from the CMS; falls back when unset. */
  heading?: string;
}

/** Order matters - this is the reading order of a case study. */
const CASE_STUDY_BLOCKS = [
  { key: 'problem', label: 'Problem' },
  { key: 'process', label: 'Process' },
  { key: 'solution', label: 'Solution' },
  { key: 'impact', label: 'Impact' },
] as const;

export function ProjectsSection({ projects, heading }: ProjectsSectionProps) {
  const visibleProjects = projects
    .filter((p) => p.is_visible)
    .sort((a, b) => a.order_index - b.order_index);

  if (visibleProjects.length === 0) return null;

  return (
    <Box>
      <RichText
        as="h2"
        html={heading || 'Selected work'}
        spacing="tight"
        textStyle="h2"
        color="text.primary"
        pb="8"
      />

      {/*
        Stacked rather than a carousel: every case study is in the page, and
        the generous gap means roughly one fills the view as you scroll.
      */}
      <VStack align="stretch" gap={{ base: '10', md: '16' }}>
        {visibleProjects.map((project) => {
          const hasCaseStudy = CASE_STUDY_BLOCKS.some(({ key }) => project[key]);
          return (
          <Card.Root
            key={project.id}
            data-testid="project-card"
            variant="outline"
            overflow="hidden"
            w="full"
          >
            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap="0">
              {/*
                The Image is wrapped rather than being a direct child:
                AspectRatio applies `object-fit: cover` to any img it owns
                directly, which would square-crop these wide screenshots.
              */}
              {project.image && (
                <AspectRatio ratio={1} bg="bg.secondary">
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    p={{ base: '6', md: '8' }}
                  >
                    <Image
                      src={project.image}
                      alt=""
                      maxW="full"
                      maxH="full"
                      objectFit="contain"
                    />
                  </Box>
                </AspectRatio>
              )}

              <Card.Body
                gap="5"
                p={{ base: '6', md: '8' }}
                justifyContent="center"
              >
                <Box>
                  <RichText
                    html={project.title}
                    spacing="tight"
                    textStyle="h3"
                    color="text.primary"
                  />
                  <RichText
                    html={project.short_description}
                    spacing="tight"
                    textStyle="body"
                    color="text.secondary"
                    mt="2"
                  />
                </Box>

                {/* Marks the turn from the intro into the case study. Hidden
                    from assistive tech - it is decoration, not content. */}
                {hasCaseStudy && (
                  <Flex
                    align="center"
                    justify="center"
                    color="text.muted"
                    aria-hidden
                    py="1"
                  >
                    <LuArrowDown size={22} />
                  </Flex>
                )}

                {/* A block with no content is omitted rather than rendered as
                    an empty labelled row. */}
                <DataList.Root orientation="vertical" gap="5">
                  {CASE_STUDY_BLOCKS.map(({ key, label }) => {
                    const value = project[key];
                    if (!value) return null;
                    return (
                      <DataList.Item key={key} data-testid={`case-study-${key}`}>
                        <DataList.ItemLabel
                          textStyle="captionBold"
                          fontWeight="bold"
                          color="text.primary"
                          textTransform="uppercase"
                          letterSpacing="wide"
                        >
                          {label}
                        </DataList.ItemLabel>
                        <DataList.ItemValue color="text.secondary">
                          <RichText html={value} textStyle="body" />
                        </DataList.ItemValue>
                      </DataList.Item>
                    );
                  })}
                </DataList.Root>

                {/*
                  Tags sit at the end rather than between the intro and the
                  case study, so the Problem -> Impact narrative reads
                  uninterrupted. Separated by a hairline as a metadata footer.
                */}
                {project.technologies && project.technologies.length > 0 && (
                  <Flex
                    gap="2"
                    wrap="wrap"
                    pt="5"
                    mt="1"
                    borderTopWidth="1px"
                    borderColor="border.default"
                  >
                    {project.technologies.map((tech, i) => (
                      <Badge
                        key={i}
                        bg="bg.muted"
                        color="text.secondary"
                        borderRadius="full"
                        px="3"
                        py="1"
                        textStyle="caption"
                        fontWeight="normal"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </Flex>
                )}
              </Card.Body>
            </Grid>
          </Card.Root>
          );
        })}
      </VStack>
    </Box>
  );
}
