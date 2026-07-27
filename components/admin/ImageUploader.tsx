'use client';

import { useRef, useState } from 'react';
import { Box, Flex, Image, Input, Text } from '@chakra-ui/react';
import { LuUpload, LuX } from 'react-icons/lu';
import { uploadImage } from '@/app/admin/actions';
import { ImageLibrary } from '@/components/admin/ImageLibrary';

interface ImageUploaderProps {
  label: string;
  name: string;
  defaultValue?: string | null;
  /** Storage sub-folder inside the henry-portfolio-images bucket. */
  folder: string;
  hint?: string;
}

/**
 * Uploads to Supabase Storage and stores the resulting public URL in a hidden
 * input, so the surrounding form just submits a URL string.
 */
export function ImageUploader({
  label,
  name,
  defaultValue,
  folder,
  hint,
}: ImageUploaderProps) {
  const [url, setUrl] = useState(defaultValue ?? '');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const result = await uploadImage(formData);
    setUploading(false);

    if (!result.ok || !result.url) {
      setError(result.error ?? 'Upload failed.');
      return;
    }
    setUrl(result.url);
  };

  return (
    <Box w="full" data-testid={`image-uploader-${name}`}>
      <Text
        display="block"
        textStyle="captionBold"
        color="text.primary"
        mb="2"
      >
        {label}
      </Text>

      <Flex gap="4" align="start" wrap="wrap">
        <Box
          w="120px"
          h="120px"
          flexShrink={0}
          borderWidth="1px"
          borderColor="border.default"
          borderRadius="md"
          bg="bg.secondary"
          overflow="hidden"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {url ? (
            <Image src={url} alt="" maxW="full" maxH="full" objectFit="contain" />
          ) : (
            <Text textStyle="caption" color="text.tertiary">
              No image
            </Text>
          )}
        </Box>

        <Flex direction="column" gap="2" flex="1" minW="240px">
          <Flex gap="2" wrap="wrap">
            <Flex
              asChild
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

            <ImageLibrary onSelect={setUrl} selectedUrl={url} />

            {url && (
              <Flex
                asChild
                align="center"
                gap="2"
                px="4"
                py="2"
                borderWidth="1px"
                borderColor="border.default"
                borderRadius="md"
                bg="bg.surface"
                cursor="pointer"
                _hover={{ bg: 'bg.secondary' }}
              >
                <button type="button" onClick={() => setUrl('')}>
                  <LuX size={14} />
                  <Text textStyle="caption">Remove</Text>
                </button>
              </Flex>
            )}
          </Flex>

          <Input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            display="none"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleFile(file);
              event.target.value = '';
            }}
          />

          <Input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="...or paste an image URL"
            borderColor="border.default"
            borderRadius="md"
            bg="bg.surface"
            px="3"
            py="5"
            fontSize="sm"
            _focusVisible={{
              borderColor: 'accent.brand',
              outline: '2px solid',
              outlineColor: 'accent.brand',
              outlineOffset: '0px',
            }}
          />

          {error && (
            <Text textStyle="caption" color="status.error">
              {error}
            </Text>
          )}
          {hint && !error && (
            <Text textStyle="caption" color="text.tertiary">
              {hint}
            </Text>
          )}
        </Flex>
      </Flex>

      <input type="hidden" name={name} value={url} readOnly />
    </Box>
  );
}
