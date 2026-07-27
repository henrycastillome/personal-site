'use client';

import { useEffect, useState, useTransition } from 'react';
import {
  Badge,
  Box,
  Button,
  CloseButton,
  Dialog,
  Flex,
  Grid,
  Image,
  Portal,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { LuImages, LuTrash2, LuCheck } from 'react-icons/lu';
import { listImages, deleteImage, type StoredImage } from '@/app/admin/actions';

interface ImageLibraryProps {
  /** Called with the public URL of the picked image. */
  onSelect: (url: string) => void;
  /** Highlighted as the current pick. */
  selectedUrl?: string;
  triggerLabel?: string;
}

/**
 * Browse everything already in the bucket and reuse it.
 *
 * Uploading is not the only way to set an image: a picture that has been used
 * before is still in storage, so it should be selectable without re-uploading.
 */
export function ImageLibrary({
  onSelect,
  selectedUrl,
  triggerLabel = 'Choose existing',
}: ImageLibraryProps) {
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<StoredImage[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Load on open, and reload each time so uploads made since are included.
  useEffect(() => {
    if (!open) return;
    setImages(null);
    setError(null);
    listImages().then((result) => {
      if (result.ok) setImages(result.images ?? []);
      else setError(result.error ?? 'Could not load images.');
    });
  }, [open]);

  const handleDelete = (image: StoredImage) => {
    if (!window.confirm(`Delete ${image.name}? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deleteImage(image.path);
      if (!result.ok) {
        setError(result.error ?? 'Could not delete that image.');
        return;
      }
      setError(null);
      setImages((current) => current?.filter((i) => i.path !== image.path) ?? null);
    });
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
      size="lg"
      scrollBehavior="inside"
    >
      <Dialog.Trigger asChild>
        <Button
          data-testid="image-library-trigger"
          variant="outline"
          colorPalette="brand"
          cursor="pointer"
        >
          <LuImages />
          {triggerLabel}
        </Button>
      </Dialog.Trigger>

      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content data-testid="image-library">
            <Dialog.Header>
              <Dialog.Title textStyle="label">Your images</Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Header>

            <Dialog.Body>
              {error && (
                <Text textStyle="caption" color="status.error" mb="4">
                  {error}
                </Text>
              )}

              {images === null && !error && (
                <Flex justify="center" py="10">
                  <Spinner colorPalette="brand" />
                </Flex>
              )}

              {images?.length === 0 && (
                <Text textStyle="caption" color="text.tertiary">
                  Nothing uploaded yet.
                </Text>
              )}

              {images && images.length > 0 && (
                <Grid
                  templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }}
                  gap="4"
                  opacity={pending ? 0.6 : 1}
                >
                  {images.map((image) => {
                    const current = image.url === selectedUrl;
                    return (
                      <Box
                        key={image.path}
                        borderWidth="1px"
                        borderColor={current ? 'accent.brand' : 'border.default'}
                        borderRadius="lg"
                        overflow="hidden"
                        bg="bg.surface"
                      >
                        <Box
                          asChild
                          w="full"
                          h="110px"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          bg="bg.secondary"
                          cursor="pointer"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              onSelect(image.url);
                              setOpen(false);
                            }}
                          >
                            <Image
                              src={image.url}
                              alt={image.name}
                              maxW="full"
                              maxH="full"
                              objectFit="contain"
                            />
                          </button>
                        </Box>

                        <Flex align="center" gap="2" px="2" py="2">
                          <Text
                            textStyle="caption"
                            color="text.tertiary"
                            truncate
                            flex="1"
                            title={image.name}
                          >
                            {image.name}
                          </Text>

                          {current && (
                            <Badge
                              colorPalette="brand"
                              variant="subtle"
                              borderRadius="full"
                            >
                              <LuCheck size={11} />
                            </Badge>
                          )}

                          {/* In-use images cannot be deleted - removing one
                              would leave a broken image on the live site. */}
                          <Box
                            asChild
                            color={image.inUse ? 'text.muted' : 'status.error'}
                            cursor={image.inUse ? 'not-allowed' : 'pointer'}
                          >
                            <button
                              type="button"
                              aria-label={
                                image.inUse
                                  ? `${image.name} is in use`
                                  : `Delete ${image.name}`
                              }
                              title={
                                image.inUse
                                  ? 'In use on the site'
                                  : 'Delete from storage'
                              }
                              disabled={image.inUse}
                              onClick={() => handleDelete(image)}
                            >
                              <LuTrash2 size={13} />
                            </button>
                          </Box>
                        </Flex>
                      </Box>
                    );
                  })}
                </Grid>
              )}
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
