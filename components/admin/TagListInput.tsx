'use client';

import { useState } from 'react';
import { Box, Flex, Input, Text } from '@chakra-ui/react';
import { LuX } from 'react-icons/lu';

interface TagListInputProps {
  label: string;
  name: string;
  defaultValue?: string[] | null;
  placeholder?: string;
  hint?: string;
}

/**
 * Edits a JSONB string array (skills, technologies, achievements, logos).
 * Serialises to JSON in a hidden input so server actions can parse it.
 */
export function TagListInput({
  label,
  name,
  defaultValue,
  placeholder = 'Type and press Enter',
  hint,
}: TagListInputProps) {
  const [items, setItems] = useState<string[]>(
    Array.isArray(defaultValue) ? defaultValue : []
  );
  const [draft, setDraft] = useState('');

  const add = () => {
    const value = draft.trim();
    if (!value || items.includes(value)) {
      setDraft('');
      return;
    }
    setItems([...items, value]);
    setDraft('');
  };

  const remove = (index: number) =>
    setItems(items.filter((_, position) => position !== index));

  return (
    <Box w="full">
      <Text
        asChild
        display="block"
        textStyle="captionBold"
        color="text.primary"
        mb="2"
      >
        <label htmlFor={`${name}-input`}>{label}</label>
      </Text>

      {items.length > 0 && (
        <Flex wrap="wrap" gap="2" mb="2">
          {items.map((item, index) => (
            <Flex
              key={`${item}-${index}`}
              align="center"
              gap="2"
              px="3"
              py="1"
              bg="bg.secondary"
              borderRadius="md"
              maxW="full"
            >
              <Text textStyle="caption" color="text.primary" truncate maxW="260px">
                {item}
              </Text>
              <Box
                asChild
                color="text.tertiary"
                cursor="pointer"
                display="flex"
                _hover={{ color: 'text.primary' }}
              >
                <button
                  type="button"
                  aria-label={`Remove ${item}`}
                  onClick={() => remove(index)}
                >
                  <LuX size={13} />
                </button>
              </Box>
            </Flex>
          ))}
        </Flex>
      )}

      <Input
        id={`${name}-input`}
        value={draft}
        placeholder={placeholder}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ',') {
            // Enter must not submit the surrounding form.
            event.preventDefault();
            add();
          }
        }}
        onBlur={add}
        borderColor="border.default"
        borderRadius="md"
        bg="bg.surface"
        px="3"
        py="5"
        _focusVisible={{
          borderColor: 'accent.brand',
          outline: '2px solid',
          outlineColor: 'accent.brand',
          outlineOffset: '0px',
        }}
      />

      {hint && (
        <Text textStyle="caption" color="text.tertiary" mt="1">
          {hint}
        </Text>
      )}

      <input type="hidden" name={name} value={JSON.stringify(items)} readOnly />
    </Box>
  );
}
