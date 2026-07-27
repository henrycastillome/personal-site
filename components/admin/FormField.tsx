'use client';

import { Field, Input, Textarea } from '@chakra-ui/react';

interface FormFieldProps {
  label: string;
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
  type?: string;
  required?: boolean;
  hint?: string;
  multiline?: boolean;
}

/**
 * Plain-text field, built on Chakra's Field so the label/control/helper-text
 * wiring (ids, aria-describedby, the required marker) comes from the library
 * rather than being hand-rolled.
 *
 * Anything that should support font styling uses RichTextEditor instead.
 */
export function FormField({
  label,
  name,
  defaultValue,
  placeholder,
  type = 'text',
  required,
  hint,
  multiline,
}: FormFieldProps) {
  const control = {
    id: name,
    name,
    defaultValue: defaultValue ?? '',
    placeholder,
    required,
    bg: 'bg.surface',
    borderRadius: 'base',
  };

  return (
    <Field.Root required={required} colorPalette="brand" data-testid={`field-${name}`}>
      <Field.Label textStyle="captionBold" color="text.primary">
        {label}
        <Field.RequiredIndicator />
      </Field.Label>

      {multiline ? (
        <Textarea {...control} rows={3} />
      ) : (
        <Input {...control} type={type} />
      )}

      {hint && (
        <Field.HelperText textStyle="caption" color="text.secondary">
          {hint}
        </Field.HelperText>
      )}
    </Field.Root>
  );
}

interface EditorFieldProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
}

/**
 * Field chrome around a RichTextEditor. Uses Field.Root for the same label and
 * helper-text treatment, but the editor is not a native control so there is no
 * `htmlFor` wiring to do.
 */
export function EditorField({ label, hint, children }: EditorFieldProps) {
  return (
    <Field.Root colorPalette="brand">
      <Field.Label textStyle="captionBold" color="text.primary">
        {label}
      </Field.Label>
      {children}
      {hint && (
        <Field.HelperText textStyle="caption" color="text.secondary">
          {hint}
        </Field.HelperText>
      )}
    </Field.Root>
  );
}
