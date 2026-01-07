'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TiptapLink from '@tiptap/extension-link';
import { useEffect, useState, useCallback } from 'react';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Heading2,
  Heading3,
  Link as LinkIcon,
  ImageIcon,
  Undo,
  Redo,
  Code,
  Minus,
  Plus,
  AlertCircle,
  CreditCard,
  LayoutGrid,
  ChevronDown,
  ListChecks,
  MousePointer,
  Video,
  Columns,
  FileText,
  X,
} from 'lucide-react';
import imageCompression from 'browser-image-compression';
import type { PresignedUrlResponse } from '@/types/upload';
import { SlashCommandMenu } from './slash-command-menu';
import { ComponentInsertModal } from './component-insert-modal';

interface BlockEditorProps {
  content: string;
  onChange: (mdx: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function BlockEditor({
  content,
  onChange,
  placeholder = 'Почніть писати, або натисніть / для вставки блоку...',
  minHeight = '400px',
}: BlockEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ x: 0, y: 0 });
  const [showComponentModal, setShowComponentModal] = useState(false);
  const [componentType, setComponentType] = useState<string | null>(null);
  const [showSourceEditor, setShowSourceEditor] = useState(false);
  const [sourceContent, setSourceContent] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded my-4',
        },
      }),
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-bronze underline hover:text-text-100',
          rel: 'noopener noreferrer',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: convertMdxToHtml(content),
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none p-4',
        style: `min-height: ${minHeight}`,
      },
      handleKeyDown: (view, event) => {
        // Handle slash command
        if (event.key === '/' && !showSlashMenu) {
          const { from } = view.state.selection;
          const coords = view.coordsAtPos(from);
          setSlashMenuPosition({ x: coords.left, y: coords.bottom });
          setShowSlashMenu(true);
          return false;
        }
        // Close slash menu on Escape
        if (event.key === 'Escape' && showSlashMenu) {
          setShowSlashMenu(false);
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const mdx = convertHtmlToMdx(html);
      onChange(mdx);
    },
  });

  // Sync content from parent
  useEffect(() => {
    if (editor && !showSourceEditor) {
      const currentMdx = convertHtmlToMdx(editor.getHTML());
      if (content !== currentMdx) {
        editor.commands.setContent(convertMdxToHtml(content));
      }
    }
  }, [content, editor, showSourceEditor]);

  // Handle image upload
  const handleImageUpload = useCallback(async (file: File) => {
    if (!editor) return;

    try {
      setIsUploading(true);

      const fileToUpload = await imageCompression(file, {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/jpeg',
        initialQuality: 0.85,
      });

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: fileToUpload.type,
          fileSize: fileToUpload.size,
          context: 'page_inline',
        }),
      });

      if (!response.ok) throw new Error('Failed to get upload URL');

      const data: PresignedUrlResponse = await response.json();

      const uploadResponse = await fetch(data.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': fileToUpload.type },
        body: fileToUpload,
      });

      if (!uploadResponse.ok) throw new Error('Failed to upload image');

      editor.chain().focus().setImage({ src: data.publicUrl }).run();
    } catch (error) {
      console.error('[BlockEditor] Image upload error:', error);
      alert('Помилка при завантаженні зображення');
    } finally {
      setIsUploading(false);
    }
  }, [editor]);

  // Handle image button click
  const handleImageButtonClick = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleImageUpload(file);
    };
    input.click();
  }, [handleImageUpload]);

  // Handle link button click
  const handleLinkButtonClick = useCallback(() => {
    const url = window.prompt('Введіть URL посилання:');
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  // Handle slash command selection
  const handleSlashCommand = useCallback((command: string) => {
    setShowSlashMenu(false);
    if (!editor) return;

    switch (command) {
      case 'heading2':
        editor.chain().focus().toggleHeading({ level: 2 }).run();
        break;
      case 'heading3':
        editor.chain().focus().toggleHeading({ level: 3 }).run();
        break;
      case 'bulletList':
        editor.chain().focus().toggleBulletList().run();
        break;
      case 'orderedList':
        editor.chain().focus().toggleOrderedList().run();
        break;
      case 'blockquote':
        editor.chain().focus().toggleBlockquote().run();
        break;
      case 'codeBlock':
        editor.chain().focus().toggleCodeBlock().run();
        break;
      case 'horizontalRule':
        editor.chain().focus().setHorizontalRule().run();
        break;
      case 'image':
        handleImageButtonClick();
        break;
      // MDX Components
      case 'callout':
      case 'card':
      case 'cardGrid':
      case 'accordion':
      case 'tabs':
      case 'steps':
      case 'cta':
      case 'video':
        setComponentType(command);
        setShowComponentModal(true);
        break;
    }
  }, [editor, handleImageButtonClick]);

  // Handle component insertion
  const handleComponentInsert = useCallback((mdxCode: string) => {
    if (!editor) return;

    // Insert the MDX as a code block or raw HTML
    // For now, we'll insert it as a paragraph with the MDX code
    editor.chain().focus().insertContent(`<p>${mdxCode}</p>`).run();

    setShowComponentModal(false);
    setComponentType(null);

    // Update the content with the MDX
    const html = editor.getHTML();
    const mdx = convertHtmlToMdx(html);
    onChange(mdx.replace(`<p>${mdxCode}</p>`, mdxCode));
  }, [editor, onChange]);

  // Toggle source editor
  const toggleSourceEditor = useCallback(() => {
    if (showSourceEditor) {
      // Apply source changes
      onChange(sourceContent);
      if (editor) {
        editor.commands.setContent(convertMdxToHtml(sourceContent));
      }
    } else {
      // Open source editor with current content
      setSourceContent(content);
    }
    setShowSourceEditor(!showSourceEditor);
  }, [showSourceEditor, sourceContent, content, onChange, editor]);

  if (!editor) return null;

  return (
    <div className="border border-line rounded-lg overflow-hidden bg-panel-900">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-panel-850 border-b border-line">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Жирний (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Курсив (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Заголовок 2"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Заголовок 3"
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Маркований список"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Нумерований список"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Цитата"
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          title="Блок коду"
        >
          <Code className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton onClick={handleLinkButtonClick} title="Додати посилання">
          <LinkIcon className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={handleImageButtonClick}
          disabled={isUploading}
          title="Додати зображення"
        >
          <ImageIcon className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Розділювач"
        >
          <Minus className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* MDX Components Dropdown */}
        <div className="relative group">
          <ToolbarButton onClick={() => {}} title="Вставити компонент">
            <Plus className="w-4 h-4" />
          </ToolbarButton>
          <div className="absolute top-full left-0 mt-1 bg-panel-850 border border-line rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 min-w-[180px]">
            <ComponentMenuItem
              icon={<AlertCircle className="w-4 h-4" />}
              label="Сповіщення"
              onClick={() => handleSlashCommand('callout')}
            />
            <ComponentMenuItem
              icon={<CreditCard className="w-4 h-4" />}
              label="Картка"
              onClick={() => handleSlashCommand('card')}
            />
            <ComponentMenuItem
              icon={<LayoutGrid className="w-4 h-4" />}
              label="Сітка карток"
              onClick={() => handleSlashCommand('cardGrid')}
            />
            <ComponentMenuItem
              icon={<ChevronDown className="w-4 h-4" />}
              label="Акордеон"
              onClick={() => handleSlashCommand('accordion')}
            />
            <ComponentMenuItem
              icon={<Columns className="w-4 h-4" />}
              label="Вкладки"
              onClick={() => handleSlashCommand('tabs')}
            />
            <ComponentMenuItem
              icon={<ListChecks className="w-4 h-4" />}
              label="Кроки"
              onClick={() => handleSlashCommand('steps')}
            />
            <ComponentMenuItem
              icon={<MousePointer className="w-4 h-4" />}
              label="Заклик до дії"
              onClick={() => handleSlashCommand('cta')}
            />
            <ComponentMenuItem
              icon={<Video className="w-4 h-4" />}
              label="Відео"
              onClick={() => handleSlashCommand('video')}
            />
          </div>
        </div>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Скасувати (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Повторити (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
        </ToolbarButton>

        {/* Source toggle */}
        <div className="ml-auto">
          <ToolbarButton
            onClick={toggleSourceEditor}
            isActive={showSourceEditor}
            title={showSourceEditor ? 'Візуальний редактор' : 'Редагувати MDX код'}
          >
            <FileText className="w-4 h-4" />
          </ToolbarButton>
        </div>
      </div>

      {/* Editor or Source */}
      <div className="relative">
        {showSourceEditor ? (
          <textarea
            value={sourceContent}
            onChange={(e) => setSourceContent(e.target.value)}
            className="w-full p-4 bg-panel-900 text-text-100 font-mono text-sm focus:outline-none resize-none"
            style={{ minHeight }}
            placeholder="MDX код..."
          />
        ) : (
          <EditorContent editor={editor} />
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-panel-900/80 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-bronze border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-500">Завантаження...</p>
            </div>
          </div>
        )}
      </div>

      {/* Slash Command Menu */}
      {showSlashMenu && (
        <SlashCommandMenu
          position={slashMenuPosition}
          onSelect={handleSlashCommand}
          onClose={() => setShowSlashMenu(false)}
        />
      )}

      {/* Component Insert Modal */}
      {showComponentModal && componentType && (
        <ComponentInsertModal
          componentType={componentType}
          onInsert={handleComponentInsert}
          onClose={() => {
            setShowComponentModal(false);
            setComponentType(null);
          }}
        />
      )}

      {/* Help text */}
      <div className="px-4 py-2 bg-panel-850 border-t border-line text-xs text-muted-500">
        <strong>Підказка:</strong> Натисніть <code className="px-1 bg-panel-900 rounded">/</code> для вставки блоку, або використовуйте панель інструментів
      </div>
    </div>
  );
}

// Toolbar button component
interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, isActive, disabled, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        p-2 rounded transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        ${isActive ? 'bg-bronze/20 text-bronze' : 'text-muted-500 hover:bg-panel-900 hover:text-text-100'}
      `}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-6 bg-line mx-1" />;
}

// Component menu item
interface ComponentMenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

function ComponentMenuItem({ icon, label, onClick }: ComponentMenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-100 hover:bg-panel-900 transition-colors first:rounded-t-lg last:rounded-b-lg"
    >
      {icon}
      {label}
    </button>
  );
}

// Convert HTML to MDX
function convertHtmlToMdx(html: string): string {
  if (!html) return '';

  let mdx = html;

  // First, convert MDX component placeholders back to MDX syntax
  // Match: <div class="mdx-component" data-component="X" data-props="Y" data-content="Z">...</div>
  mdx = mdx.replace(/<div[^>]*class="mdx-component"[^>]*data-component="([^"]*)"[^>]*data-props="([^"]*)"(?:[^>]*data-content="([^"]*)")?[^>]*>[\s\S]*?<\/div>/gi,
    (match, component, encodedProps, encodedContent) => {
      const props = decodeURIComponent(encodedProps || '');
      const content = encodedContent ? decodeURIComponent(encodedContent) : '';

      if (content) {
        // Block component with content
        return `<${component}${props ? ' ' + props : ''}>\n${content}\n</${component}>`;
      } else if (props) {
        // Self-closing component with props
        return `<${component} ${props} />`;
      } else {
        // Self-closing component without props
        return `<${component} />`;
      }
    }
  );

  // Then convert standard HTML to markdown
  mdx = mdx
    // Headings
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
    // Paragraphs
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    // Bold and italic
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    // Lists
    .replace(/<ul[^>]*>/gi, '')
    .replace(/<\/ul>/gi, '\n')
    .replace(/<ol[^>]*>/gi, '')
    .replace(/<\/ol>/gi, '\n')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    // Links
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    // Images
    .replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)')
    .replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, '![]($1)')
    // Blockquotes
    .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (match, content) => {
      return content.split('\n').map((line: string) => `> ${line.trim()}`).join('\n') + '\n\n';
    })
    // Code blocks
    .replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '```\n$1\n```\n\n')
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
    // Horizontal rule
    .replace(/<hr[^>]*\/?>/gi, '---\n\n')
    // Line breaks
    .replace(/<br[^>]*\/?>/gi, '\n')
    // Clean up empty tags
    .replace(/<[^>]+><\/[^>]+>/g, '')
    // Clean up remaining span/div wrappers
    .replace(/<\/?(?:span|div)[^>]*>/gi, '')
    // Clean up multiple newlines
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return mdx;
}

// MDX component patterns for detection and conversion
const MDX_COMPONENTS = ['Callout', 'Card', 'CardGrid', 'Accordion', 'Tabs', 'Tab', 'Steps', 'Step', 'CTA', 'Video', 'Quote', 'Hero', 'Stats', 'Divider', 'LinkCard'];

// Convert MDX to HTML for editor
function convertMdxToHtml(mdx: string): string {
  if (!mdx) return '';

  let html = mdx;

  // First, convert MDX components to special placeholder divs
  // Self-closing components like <CTA ... />
  MDX_COMPONENTS.forEach(component => {
    // Self-closing: <Component prop="value" />
    const selfClosingRegex = new RegExp(`<${component}([^>]*?)\\s*/>`, 'gi');
    html = html.replace(selfClosingRegex, (match, props) => {
      const propsStr = props.trim();
      return `<div class="mdx-component" data-component="${component}" data-props="${encodeURIComponent(propsStr)}" contenteditable="false"><span class="mdx-component-label">${component}</span>${propsStr ? `<span class="mdx-component-props">${decodeProps(propsStr)}</span>` : ''}</div>`;
    });

    // Block components: <Component props>content</Component>
    const blockRegex = new RegExp(`<${component}([^>]*)>([\\s\\S]*?)<\\/${component}>`, 'gi');
    html = html.replace(blockRegex, (match, props, content) => {
      const propsStr = (props || '').trim();
      const contentStr = (content || '').trim();
      return `<div class="mdx-component" data-component="${component}" data-props="${encodeURIComponent(propsStr)}" data-content="${encodeURIComponent(contentStr)}" contenteditable="false"><span class="mdx-component-label">${component}</span>${propsStr ? `<span class="mdx-component-props">${decodeProps(propsStr)}</span>` : ''}${contentStr ? `<span class="mdx-component-content">${contentStr.substring(0, 100)}${contentStr.length > 100 ? '...' : ''}</span>` : ''}</div>`;
    });
  });

  // Then convert standard markdown to HTML
  html = html
    // Headings
    .replace(/^### (.*)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    // Bold and italic
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
    // Lists - simple approach
    .replace(/^- (.*)$/gm, '<li>$1</li>')
    // Code
    .replace(/```([\s\S]+?)```/g, '<pre><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr />')
    // Blockquotes
    .replace(/^> (.*)$/gm, '<blockquote>$1</blockquote>')
    // Paragraphs - wrap remaining lines (but not empty lines or already wrapped content)
    .replace(/^([^<\n].*)$/gm, '<p>$1</p>');

  // Wrap list items in ul
  if (html.includes('<li>')) {
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
  }

  return html;
}

// Helper to decode props for display
function decodeProps(props: string): string {
  // Extract key prop values for display
  const titleMatch = props.match(/title="([^"]*)"/);
  const typeMatch = props.match(/type="([^"]*)"/);
  if (titleMatch) return titleMatch[1];
  if (typeMatch) return typeMatch[1];
  return props.substring(0, 50);
}

export default BlockEditor;
