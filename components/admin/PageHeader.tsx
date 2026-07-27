import { Box, Heading, Text } from '@chakra-ui/react';

export function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <Box mb="8">
      <Heading as="h1" textStyle="h3" color="text.primary">
        {title}
      </Heading>
      {description && (
        <Text textStyle="caption" color="text.secondary" mt="1">
          {description}
        </Text>
      )}
    </Box>
  );
}
