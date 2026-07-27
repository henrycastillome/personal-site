'use client';

import { useCallback, useEffect, useState } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyleKit } from '@tiptap/extension-text-style';
import { Box, Flex, IconButton } from '@chakra-ui/react';
import {
  LuBold,
  LuItalic,
  LuUnderline,
  LuStrikethrough,
  LuList,
  LuListOrdered,
  LuLink2,
  LuLink2Off,
  LuAlignLeft,
  LuAlignCenter,
  LuAlignRight,
  LuRemoveFormatting,
  LuUndo2,
  LuRedo2,
} from 'react-icons/lu';

/* -------------------------------------------------------------------------- */
/* Presets                                                                     */
/*                                                                             */
/* Curated lists rather than free numeric input, so every edit stays on-brand   */
/* and nobody can accidentally ship a 300px hero title.                         */
/* -------------------------------------------------------------------------- */

const FONT_SIZES = [
  { label: 'Size: default', value: '' },
  { label: 'Small - 14', value: '14px' },
  { label: 'Body - 16', value: '16px' },
  { label: 'Large - 20', value: '20px' },
  { label: 'XL - 24', value: '24px' },
  { label: 'Heading - 32', value: '32px' },
  { label: 'Big - 40', value: '40px' },
  { label: 'Display - 56', value: '56px' },
  { label: 'Hero - 72', value: '72px' },
];

const FONT_FAMILIES = [
  { label: 'Font: default', value: '' },
  { label: 'Serif (Georgia)', value: 'Georgia, "Times New Roman", serif' },
  { label: 'Mono (Menlo)', value: 'Menlo, Monaco, "Courier New", monospace' },
];

/** Theme colours only - keeps every edit inside the palette. */
const COLORS = [
  { label: 'Colour: default', value: '' },
  { label: 'Midnight', value: '#0a0b0d' },
  { label: 'Slate', value: '#5b616e' },
  { label: 'Link teal', value: '#2dd4bf' },
];

const BLOCKS = [
  { label: 'Body text', value: 'paragraph' },
  { label: 'Heading 2', value: '2' },
  { label: 'Heading 3', value: '3' },
  { label: 'Heading 4', value: '4' },
];

/* -------------------------------------------------------------------------- */

interface RichTextEditorProps {
  /** Field name - a hidden input of this name carries the HTML into the form. */
  name: string;
  defaultValue?: string | null;
  /**
   * 'full'    everything (bios, long descriptions)
   * 'minimal' no block/list/align controls - for one-line fields such as the
   *           hero title, where a heading or bullet list makes no sense.
   */
  variant?: 'full' | 'minimal';
  minH?: string;
}

export function RichTextEditor({
  name,
  defaultValue,
  variant = 'full',
  minH = '120px',
}: RichTextEditorProps) {
  // Mirrored into a hidden input so the editor works inside a plain <form>
  // submitted through a server action.
  const [html, setHtml] = useState(defaultValue || '');

  const editor = useEditor({
    // Required under Next's SSR - without it the first client render mismatches.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: false, // configured separately below
      }),
      TextStyleKit, // TextStyle + FontSize + FontFamily + Color + LineHeight
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false, autolink: false }),
    ],
    content: defaultValue || '',
    editorProps: {
      attributes: { class: 'madeline-editor' },
    },
    onUpdate: ({ editor: current }) => setHtml(current.getHTML()),
  });

  return (
    <Box
      borderWidth="1px"
      borderColor="border.default"
      borderRadius="md"
      bg="bg.surface"
      overflow="hidden"
    >
      {editor && <Toolbar editor={editor} variant={variant} />}

      <Box
        px="4"
        py="3"
        css={{
          '& .madeline-editor': { outline: 'none', minHeight: minH },
          '& .madeline-editor p': { marginBottom: '0.75rem' },
          '& .madeline-editor p:last-child': { marginBottom: 0 },
          '& .madeline-editor h2': { fontSize: '1.5em', fontWeight: 800 },
          '& .madeline-editor h3': { fontSize: '1.25em', fontWeight: 800 },
          '& .madeline-editor h4': { fontSize: '1.1em', fontWeight: 800 },
          '& .madeline-editor ul': { listStyleType: 'disc', paddingLeft: '1.25rem' },
          '& .madeline-editor ol': { listStyleType: 'decimal', paddingLeft: '1.25rem' },
          '& .madeline-editor li': { marginBottom: '0.25rem' },
          '& .madeline-editor a': {
            color: 'accent.brand',
            textDecoration: 'underline',
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>

      <input type="hidden" name={name} value={html} readOnly />
    </Box>
  );
}

/* -------------------------------------------------------------------------- */
/* Toolbar                                                                     */
/* -------------------------------------------------------------------------- */

function Toolbar({
  editor,
  variant,
}: {
  editor: Editor;
  variant: 'full' | 'minimal';
}) {
  useEditorSync(editor);

  const currentBlock = editor.isActive('heading', { level: 2 })
    ? '2'
    : editor.isActive('heading', { level: 3 })
      ? '3'
      : editor.isActive('heading', { level: 4 })
        ? '4'
        : 'paragraph';

  const textStyle = editor.getAttributes('textStyle');
  const currentSize: string = textStyle.fontSize ?? '';
  const currentFamily: string = textStyle.fontFamily ?? '';
  const currentColor: string = textStyle.color ?? '';

  const setBlock = (value: string) => {
    if (value === 'paragraph') {
      editor.chain().focus().setParagraph().run();
    } else {
      editor
        .chain()
        .focus()
        .setHeading({ level: Number(value) as 2 | 3 | 4 })
        .run();
    }
  };

  const setSize = (value: string) =>
    value
      ? editor.chain().focus().setFontSize(value).run()
      : editor.chain().focus().unsetFontSize().run();

  const setFamily = (value: string) =>
    value
      ? editor.chain().focus().setFontFamily(value).run()
      : editor.chain().focus().unsetFontFamily().run();

  const setColor = (value: string) =>
    value
      ? editor.chain().focus().setColor(value).run()
      : editor.chain().focus().unsetColor().run();

  const toggleLink = useCallback(() => {
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const url = window.prompt('Link URL', editor.getAttributes('link').href ?? '');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .setLink({ href: url, target: '_blank', rel: 'noopener noreferrer' })
      .run();
  }, [editor]);

  return (
    <Flex
      wrap="wrap"
      align="center"
      gap="1"
      px="2"
      py="2"
      bg="bg.secondary"
      borderBottomWidth="1px"
      borderColor="border.default"
    >
      <ToolButton
        label="Bold"
        active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <LuBold />
      </ToolButton>
      <ToolButton
        label="Italic"
        active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <LuItalic />
      </ToolButton>
      <ToolButton
        label="Underline"
        active={editor.isActive('underline')}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <LuUnderline />
      </ToolButton>
      <ToolButton
        label="Strikethrough"
        active={editor.isActive('strike')}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <LuStrikethrough />
      </ToolButton>

      <Divider />

      {variant === 'full' && (
        <ToolSelect
          label="Text style"
          value={currentBlock}
          options={BLOCKS}
          onChange={setBlock}
          width="115px"
        />
      )}

      {/* The two controls this feature exists for. */}
      <ToolSelect
        label="Font size"
        value={currentSize}
        options={FONT_SIZES}
        onChange={setSize}
        width="125px"
      />
      <ToolSelect
        label="Font"
        value={currentFamily}
        options={FONT_FAMILIES}
        onChange={setFamily}
        width="140px"
      />
      <ToolSelect
        label="Colour"
        value={currentColor}
        options={COLORS}
        onChange={setColor}
        width="130px"
        swatch
      />

      <Divider />

      {variant === 'full' && (
        <>
          <ToolButton
            label="Bullet list"
            active={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <LuList />
          </ToolButton>
          <ToolButton
            label="Numbered list"
            active={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <LuListOrdered />
          </ToolButton>
          <ToolButton
            label="Align left"
            active={editor.isActive({ textAlign: 'left' })}
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
          >
            <LuAlignLeft />
          </ToolButton>
          <ToolButton
            label="Align centre"
            active={editor.isActive({ textAlign: 'center' })}
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
          >
            <LuAlignCenter />
          </ToolButton>
          <ToolButton
            label="Align right"
            active={editor.isActive({ textAlign: 'right' })}
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
          >
            <LuAlignRight />
          </ToolButton>

          <Divider />
        </>
      )}

      <ToolButton
        label={editor.isActive('link') ? 'Remove link' : 'Add link'}
        active={editor.isActive('link')}
        onClick={toggleLink}
      >
        {editor.isActive('link') ? <LuLink2Off /> : <LuLink2 />}
      </ToolButton>
      <ToolButton
        label="Clear formatting"
        onClick={() => editor.chain().focus().unsetAllMarks().run()}
      >
        <LuRemoveFormatting />
      </ToolButton>

      <Divider />

      <ToolButton
        label="Undo"
        disabled={!editor.can().undo()}
        onClick={() => editor.chain().focus().undo().run()}
      >
        <LuUndo2 />
      </ToolButton>
      <ToolButton
        label="Redo"
        disabled={!editor.can().redo()}
        onClick={() => editor.chain().focus().redo().run()}
      >
        <LuRedo2 />
      </ToolButton>
    </Flex>
  );
}

/**
 * Re-renders the toolbar on every transaction so the active states and the
 * font-size / font / colour dropdowns follow the caret.
 */
function useEditorSync(editor: Editor) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const handler = () => setTick((tick) => tick + 1);
    editor.on('transaction', handler);
    return () => {
      editor.off('transaction', handler);
    };
  }, [editor]);
}

function Divider() {
  return <Box w="1px" alignSelf="stretch" bg="border.default" mx="1" />;
}

function ToolButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <IconButton
      type="button"
      aria-label={label}
      title={label}
      size="sm"
      variant="ghost"
      disabled={disabled}
      onClick={onClick}
      color={active ? 'text.inverse' : 'text.secondary'}
      bg={active ? 'accent.brand' : 'transparent'}
      borderRadius="sm"
      cursor="pointer"
      _hover={{ bg: active ? 'accent.brand' : 'bg.surface' }}
    >
      {children}
    </IconButton>
  );
}

function ToolSelect({
  label,
  value,
  options,
  onChange,
  width,
  swatch,
}: {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
  width: string;
  swatch?: boolean;
}) {
  // A value set outside the presets (hand-edited HTML) still needs an entry, or
  // the select would silently snap back to "default".
  const options_ =
    value && !options.some((option) => option.value === value)
      ? [...options, { label: value, value }]
      : options;

  return (
    <Flex align="center" gap="1">
      {swatch && value && (
        <Box
          w="14px"
          h="14px"
          borderRadius="sm"
          bg={value}
          borderWidth="1px"
          borderColor="border.dark"
        />
      )}
      <Box
        asChild
        w={width}
        h="32px"
        px="2"
        fontSize="sm"
        color="text.secondary"
        bg="bg.surface"
        borderWidth="1px"
        borderColor="border.default"
        borderRadius="sm"
        cursor="pointer"
      >
        <select
          aria-label={label}
          title={label}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {options_.map((option) => (
            <option key={option.value || 'default'} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Box>
    </Flex>
  );
}
