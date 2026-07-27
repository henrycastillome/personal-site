'use client';

import { useActionState, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Flex, Grid, Text, VStack } from '@chakra-ui/react';
import { LuPlus, LuBriefcase, LuGraduationCap } from 'react-icons/lu';
import {
  saveWorkHistory,
  deleteWorkHistory,
  moveWorkHistory,
  type ActionResult,
} from '@/app/admin/actions';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { FormField, EditorField } from '@/components/admin/FormField';
import { MultiImageUploader } from '@/components/admin/MultiImageUploader';
import { TagListInput } from '@/components/admin/TagListInput';
import { VisibilityToggle } from '@/components/admin/VisibilityToggle';
import { SaveBar } from '@/components/admin/SaveBar';
import { SectionHeadingForm } from '@/components/admin/SectionHeadingForm';
import { ListItemCard, stripHtml } from '@/components/admin/ListItemCard';
import type { WorkHistory } from '@/lib/types';

function yearRange(entry: WorkHistory) {
  const start = entry.start_date?.split('-')[0] ?? '';
  const end = entry.is_current
    ? 'present'
    : (entry.end_date?.split('-')[0] ?? 'present');
  return `${start} - ${end}`;
}

export function BackgroundManager({
  entries,
  heading,
}: {
  entries: WorkHistory[];
  heading?: string;
}) {
  const [adding, setAdding] = useState(false);

  return (
    <VStack align="stretch" gap="4">
      <SectionHeadingForm
        name="background_heading"
        defaultValue={heading}
        hint="The title shown above your career timeline on the homepage."
      />

      {entries.length === 0 && !adding && (
        <Text textStyle="caption" color="text.tertiary">
          No timeline entries yet. Add your first one below.
        </Text>
      )}

      {entries.map((entry) => (
        <ListItemCard
          key={entry.id}
          title={stripHtml(entry.position) || entry.company}
          subtitle={`${entry.company} - ${yearRange(entry)}`}
          visible={entry.is_visible}
          onMove={(direction) => moveWorkHistory(entry.id, direction)}
          onDelete={() => deleteWorkHistory(entry.id)}
          deleteConfirm={`Delete "${stripHtml(entry.position) || entry.company}"? This cannot be undone.`}
        >
          <WorkHistoryForm entry={entry} />
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
            New timeline entry
          </Text>
          <WorkHistoryForm
            nextOrderIndex={entries.length}
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
              Add a timeline entry
            </Text>
          </button>
        </Flex>
      )}
    </VStack>
  );
}

function WorkHistoryForm({
  entry,
  nextOrderIndex,
  onSaved,
}: {
  entry?: WorkHistory;
  nextOrderIndex?: number;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const [isCurrent, setIsCurrent] = useState(entry?.is_current ?? false);
  const [entryType, setEntryType] = useState<'work' | 'education'>(
    entry?.entry_type ?? 'work'
  );

  const [result, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    async (prev, formData) => {
      const outcome = await saveWorkHistory(prev, formData);
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
      <input type="hidden" name="id" value={entry?.id ?? ''} />
      <input
        type="hidden"
        name="order_index"
        value={entry?.order_index ?? nextOrderIndex ?? 0}
      />
      <input type="hidden" name="is_current" value={isCurrent ? 'true' : 'false'} />
      <input type="hidden" name="entry_type" value={entryType} />

      <VStack align="stretch" gap="6">
        {/* Work / Education — picks the timeline node icon */}
        <Flex gap="2">
          {(
            [
              { value: 'work', label: 'Work', Icon: LuBriefcase },
              { value: 'education', label: 'Education', Icon: LuGraduationCap },
            ] as const
          ).map(({ value, label, Icon }) => {
            const selected = entryType === value;
            return (
              <Flex
                key={value}
                asChild
                flex="1"
                align="center"
                justify="center"
                gap="2"
                px="3"
                py="2"
                borderWidth="1px"
                borderColor={selected ? 'accent.brand' : 'border.default'}
                borderRadius="md"
                bg={selected ? 'bg.secondary' : 'bg.surface'}
                color={selected ? 'accent.brand' : 'text.tertiary'}
                cursor="pointer"
              >
                <button type="button" onClick={() => setEntryType(value)}>
                  <Icon size={16} />
                  <Text textStyle="captionBold">{label}</Text>
                </button>
              </Flex>
            );
          })}
        </Flex>

        <EditorField
          label={entryType === 'education' ? 'Degree' : 'Role'}
          hint="The heading shown next to the year on the timeline."
        >
          <RichTextEditor
            name="position"
            defaultValue={entry?.position}
            variant="minimal"
            minH="55px"
          />
        </EditorField>

        <FormField
          label={entryType === 'education' ? 'School' : 'Company'}
          name="company"
          required
          defaultValue={entry?.company}
        />

        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap="4">
          <FormField
            label="Start date"
            name="start_date"
            type="date"
            required
            defaultValue={entry?.start_date}
            hint="Only the year is shown on the site."
          />
          {!isCurrent && (
            <FormField
              label="End date"
              name="end_date"
              type="date"
              defaultValue={entry?.end_date}
            />
          )}
        </Grid>

        <Flex
          asChild
          alignSelf="start"
          align="center"
          gap="2"
          px="3"
          py="2"
          borderWidth="1px"
          borderColor={isCurrent ? 'accent.brand' : 'border.default'}
          borderRadius="md"
          bg="bg.surface"
          cursor="pointer"
          color={isCurrent ? 'accent.brand' : 'text.tertiary'}
        >
          <button type="button" onClick={() => setIsCurrent(!isCurrent)}>
            <Text textStyle="captionBold">
              {isCurrent ? 'Current role (shows "present")' : 'Mark as current role'}
            </Text>
          </button>
        </Flex>

        <FormField label="Location" name="location" defaultValue={entry?.location} />

        <EditorField
          label="Description"
          hint="Not shown on the homepage yet - stored for future use."
        >
          <RichTextEditor
            name="description"
            defaultValue={entry?.description}
            minH="110px"
          />
        </EditorField>

        <MultiImageUploader
          label="Company logos"
          name="logos"
          folder="logos"
          defaultValue={entry?.logos}
          hint="Shown in a row under the role. Transparent PNGs look best."
        />

        <TagListInput
          label="Achievements"
          name="achievements"
          defaultValue={entry?.achievements}
        />
        <TagListInput
          label="Skills used"
          name="skills_used"
          defaultValue={entry?.skills_used}
        />

        <SaveBar result={result} label={entry ? 'Save entry' : 'Add entry'} pending={isPending}>
          <VisibilityToggle
            name="is_visible"
            defaultChecked={entry?.is_visible ?? true}
          />
        </SaveBar>
      </VStack>
    </form>
  );
}
