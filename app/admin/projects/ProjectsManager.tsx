'use client';

import { useActionState, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Flex, Text, VStack } from '@chakra-ui/react';
import { LuPlus } from 'react-icons/lu';
import {
  saveProject,
  deleteProject,
  moveProject,
  type ActionResult,
} from '@/app/admin/actions';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { EditorField } from '@/components/admin/FormField';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { TagListInput } from '@/components/admin/TagListInput';
import { VisibilityToggle } from '@/components/admin/VisibilityToggle';
import { SaveBar } from '@/components/admin/SaveBar';
import { SectionHeadingForm } from '@/components/admin/SectionHeadingForm';
import { ListItemCard, stripHtml } from '@/components/admin/ListItemCard';
import type { Project } from '@/lib/types';

export function ProjectsManager({
  projects,
  heading,
}: {
  projects: Project[];
  heading?: string;
}) {
  const [adding, setAdding] = useState(false);

  return (
    <VStack align="stretch" gap="4">
      <SectionHeadingForm
        name="projects_heading"
        defaultValue={heading}
        hint="The title shown above your projects on the homepage."
      />

      {projects.length === 0 && !adding && (
        <Text textStyle="caption" color="text.tertiary">
          No projects yet. Add your first one below.
        </Text>
      )}

      {projects.map((project) => (
        <ListItemCard
          key={project.id}
          title={stripHtml(project.title)}
          subtitle={stripHtml(project.short_description)}
          visible={project.is_visible}
          onMove={(direction) => moveProject(project.id, direction)}
          onDelete={() => deleteProject(project.id)}
          deleteConfirm={`Delete "${stripHtml(project.title)}"? This cannot be undone.`}
        >
          <ProjectForm project={project} />
        </ListItemCard>
      ))}

      {adding ? (
        <Box
          borderWidth="1px"
          borderColor="accent.brand"
          borderRadius="lg"
          bg="bg.surface"
          p="5"
        >
          <Text textStyle="bodyBold" color="text.primary" mb="4">
            New project
          </Text>
          <ProjectForm
            nextOrderIndex={projects.length}
            onSaved={() => setAdding(false)}
          />
        </Box>
      ) : (
        <Flex
          asChild
          align="center"
          justify="center"
          gap="2"
          py="4"
          borderWidth="1px"
          borderStyle="dashed"
          borderColor="border.default"
          borderRadius="lg"
          cursor="pointer"
          color="text.tertiary"
          _hover={{ borderColor: 'accent.brand', color: 'text.primary' }}
        >
          <button type="button" onClick={() => setAdding(true)}>
            <LuPlus size={15} />
            <Text textStyle="captionBold">
              Add a project
            </Text>
          </button>
        </Flex>
      )}
    </VStack>
  );
}

function ProjectForm({
  project,
  nextOrderIndex,
  onSaved,
}: {
  project?: Project;
  nextOrderIndex?: number;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const [result, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    async (prev, formData) => {
      const outcome = await saveProject(prev, formData);
      if (outcome.ok) {
        router.refresh();
        onSaved?.();
      }
      return outcome;
    },
    null
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={project?.id ?? ''} />
      <input
        type="hidden"
        name="order_index"
        value={project?.order_index ?? nextOrderIndex ?? 0}
      />

      <VStack align="stretch" gap="6">
        <EditorField label="Title">
          <RichTextEditor
            name="title"
            defaultValue={project?.title}
            variant="minimal"
            minH="55px"
          />
        </EditorField>

        <EditorField
          label="Card description"
          hint="Shown on the card. Kept to about four lines on the site."
        >
          <RichTextEditor
            name="short_description"
            defaultValue={project?.short_description}
            minH="110px"
          />
        </EditorField>

        {/* Case-study blocks. Each renders as a labelled row on the project
            card; leaving one empty simply omits that row. */}
        <EditorField label="Problem" hint="What needed solving.">
          <RichTextEditor name="problem" defaultValue={project?.problem} minH="100px" />
        </EditorField>

        <EditorField label="Process" hint="How you approached it.">
          <RichTextEditor name="process" defaultValue={project?.process} minH="100px" />
        </EditorField>

        <EditorField label="Solution" hint="What you built or changed.">
          <RichTextEditor name="solution" defaultValue={project?.solution} minH="100px" />
        </EditorField>

        <EditorField label="Impact" hint="The outcome - numbers help.">
          <RichTextEditor name="impact" defaultValue={project?.impact} minH="100px" />
        </EditorField>

        <TagListInput
          label="Tags"
          name="technologies"
          defaultValue={project?.technologies}
          hint="Press Enter after each tag."
        />

        <ImageUploader
          label="Card image"
          name="image"
          folder="projects"
          defaultValue={project?.image}
        />

        <SaveBar result={result} label={project ? 'Save project' : 'Add project'} pending={isPending}>
          <VisibilityToggle
            name="is_visible"
            defaultChecked={project?.is_visible ?? true}
          />
        </SaveBar>
      </VStack>
    </form>
  );
}
