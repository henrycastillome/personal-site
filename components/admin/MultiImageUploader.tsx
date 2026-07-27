'use client';

import { useRef, useState } from 'react';
import { Box, Flex, Image, Input, Text } from '@chakra-ui/react';
import { LuUpload, LuX } from 'react-icons/lu';
import { uploadImage } from '@/app/admin/actions';
import { ImageLibrary } from '@/components/admin/ImageLibrary';

interface MultiImageUploaderProps {
  label: string;
  name: string;
  defaultValue?: string[] | null;
  folder: string;
  hint?: string;
}

/**
 * Ordered list of image URLs (company logos), serialised as JSON into a hidden
 * input. Same upload path as ImageUploader, but many at a time.
 */
export function MultiImageUploader({
  label,
  name,
  defaultValue,
  folder,
  hint,
}: MultiImageUploaderProps) {
  const [urls, setUrls] = useState<string[]>(
    Array.isArray(defaultValue) ? defaultValue : []
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList) => {
    setUploading(true);
    setError(null);

    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const result = await uploadImage(formData);
      if (!result.ok || !result.url) {
        setError(result.error ?? 'Upload failed.');
        break;
      }
      uploaded.push(result.url);
    }

    if (uploaded.length) setUrls((current) => [...current, ...uploaded]);
    setUploading(false);
  };

  const remove = (index: number) =>
    setUrls(urls.filter((_, position) => position !== index));

  return (
    <Box w="full">
      <Text
        display="block"
        textStyle="captionBold"
        color="text.primary"
        mb="2"
      >
        {label}
      </Text>

      <Flex wrap="wrap" gap="3" mb="3">
        {urls.map((url, index) => (
          <Box key={`${url}-${index}`} position="relative">
            <Box
              w="90px"
              h="70px"
              borderWidth="1px"
              borderColor="border.default"
              borderRadius="md"
              bg="bg.surface"
              display="flex"
              alignItems="center"
              justifyContent="center"
              overflow="hidden"
            >
              <Image src={url} alt="" maxW="full" maxH="full" objectFit="contain" />
            </Box>
            <Box
              asChild
              position="absolute"
              top="-6px"
              right="-6px"
              w="20px"
              h="20px"
              borderRadius="full"
              bg="text.primary"
              color="text.inverse"
              display="flex"
              alignItems="center"
              justifyContent="center"
              cursor="pointer"
            >
              <button
                type="button"
                aria-label="Remove image"
                onClick={() => remove(index)}
              >
                <LuX size={11} />
              </button>
            </Box>
          </Box>
        ))}
      </Flex>

      <Flex
        asChild
        display="inline-flex"
        align="center"
        gap="2"
        px="4"
        py="2"
        borderWidth="1px"
        borderColor="border.dark"
        borderRadius="md"
        bg="bg.surface"
        cursor="pointer"
        opacity={uploading ? 0.6 : 1}
        _hover={{ bg: 'bg.secondary' }}
      >
        <button type="button" onClick={() => fileInput.current?.click()}>
          <LuUpload size={14} />
          <Text textStyle="captionBold">
            {uploading ? 'Uploading...' : 'Upload new'}
          </Text>
        </button>
      </Flex>

      <Box display="inline-block" ml="2">
        <ImageLibrary
          onSelect={(u) => setUrls((current) => (current.includes(u) ? current : [...current, u]))}
          triggerLabel="Add existing"
        />
      </Box>

      <Input
        ref={fileInput}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        display="none"
        onChange={(event) => {
          const files = event.target.files;
          if (files?.length) void handleFiles(files);
          event.target.value = '';
        }}
      />

      {error && (
        <Text textStyle="caption" color="status.error" mt="1">
          {error}
        </Text>
      )}
      {hint && !error && (
        <Text textStyle="caption" color="text.tertiary" mt="1">
          {hint}
        </Text>
      )}

      <input type="hidden" name={name} value={JSON.stringify(urls)} readOnly />
    </Box>
  );
}
