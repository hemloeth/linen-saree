"use client";

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          'min-h-[300px] w-full rounded-b-md border border-t-0 border-input bg-background px-4 py-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 prose prose-sm max-w-none dark:prose-invert prose-headings:font-serif prose-headings:text-primary prose-a:text-primary focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col w-full">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border border-input bg-muted/20 p-1 rounded-t-md">
        <Button
          variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
          size="sm"
          className="h-8 w-8 px-0"
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }}
          aria-label="Toggle bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
          size="sm"
          className="h-8 w-8 px-0"
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }}
          aria-label="Toggle italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive('strike') ? 'secondary' : 'ghost'}
          size="sm"
          className="h-8 w-8 px-0"
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleStrike().run(); }}
          aria-label="Toggle strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button
          variant={editor.isActive('heading', { level: 1 }) ? 'secondary' : 'ghost'}
          size="sm"
          className="h-8 w-8 px-0"
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 1 }).run(); }}
          aria-label="Toggle heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive('heading', { level: 2 }) ? 'secondary' : 'ghost'}
          size="sm"
          className="h-8 w-8 px-0"
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 2 }).run(); }}
          aria-label="Toggle heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button
          variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'}
          size="sm"
          className="h-8 w-8 px-0"
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); }}
          aria-label="Toggle bullet list"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'}
          size="sm"
          className="h-8 w-8 px-0"
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run(); }}
          aria-label="Toggle ordered list"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive('blockquote') ? 'secondary' : 'ghost'}
          size="sm"
          className="h-8 w-8 px-0"
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBlockquote().run(); }}
          aria-label="Toggle blockquote"
        >
          <Quote className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => { e.preventDefault(); editor.chain().focus().undo().run(); }}
          disabled={!editor.can().undo()}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => { e.preventDefault(); editor.chain().focus().redo().run(); }}
          disabled={!editor.can().redo()}
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Editor Content */}
      <EditorContent editor={editor} />
    </div>
  )
}
