import React, { useState, useEffect } from 'react';
import { EditorProvider, useCurrentEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import FontFamily from '@tiptap/extension-font-family';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { exportToDocx, importFromDocx, exportToPdf, importFromExcel, importFromPdf } from '../utils/documentUtils';
import { isValidLinkUrl, isValidImageUrl } from '../utils/securityUtils';
import './LjTextArea.css';

// Define the props for our component
export interface LjTextAreaProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  
  // Feature toggles
  features?: {
    basicFormatting?: boolean;
    advancedFormatting?: boolean;
    lists?: boolean;
    alignment?: boolean;
    colors?: boolean;
    images?: boolean;
    tables?: boolean;
    documentHandling?: boolean;
  };
  
  // Display modes
  toolbarMode?: 'full' | 'minimal' | 'compact';
  
  // Tailwind CSS support
  /**
   * When true, the component will use Tailwind CSS utility classes instead of built-in styles
   * This allows for better customization with Tailwind
   */
  useTailwind?: boolean;
}

// Toolbar component for formatting options
const Toolbar = ({ features, toolbarMode, useTailwind }: { features: LjTextAreaProps['features'], toolbarMode: LjTextAreaProps['toolbarMode'], useTailwind?: boolean }) => {
  const { editor } = useCurrentEditor();

  if (!editor) {
    return null;
  }

  // If using Tailwind, we'll use Tailwind classes instead of custom CSS
  const toolbarClass = useTailwind 
    ? `flex flex-wrap items-center gap-1 p-2 ${toolbarMode === 'minimal' ? 'p-1' : toolbarMode === 'compact' ? 'p-1.5' : 'p-2'} bg-gray-50 border-b border-gray-200`
    : `lj-text-area-toolbar toolbar-mode-${toolbarMode}`;

  // Collapsible section component
  const CollapsibleSection = ({ title, children, defaultOpen = true }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);
    
    if (toolbarMode === 'minimal') return null;
    
    if (useTailwind) {
      return (
        <div className="flex items-center mx-1 border border-gray-300 rounded bg-gray-100">
          <button 
            className="bg-gray-200 border-none rounded py-1.5 px-3 cursor-pointer text-xs font-medium flex items-center gap-1"
            onClick={() => setIsOpen(!isOpen)}
          >
            {title} {isOpen ? '▲' : '▼'}
          </button>
          {isOpen && <div className="flex gap-1 p-1 bg-white border-l border-gray-300">{children}</div>}
        </div>
      );
    }
    
    return (
      <div className="toolbar-section">
        <button 
          className="section-toggle"
          onClick={() => setIsOpen(!isOpen)}
        >
          {title} {isOpen ? '▲' : '▼'}
        </button>
        {isOpen && <div className="section-content">{children}</div>}
      </div>
    );
  };

  // Button styling based on Tailwind usage
  const getButtonClass = (isActive = false) => {
    if (useTailwind) {
      const baseClass = "flex items-center justify-center font-medium rounded border";
      const sizeClass = toolbarMode === 'minimal' 
        ? "text-xs py-1 px-2 h-7 min-w-7" 
        : toolbarMode === 'compact' 
        ? "text-sm py-1.5 px-2.5 h-8 min-w-8" 
        : "py-1.5 px-2.5 h-9 min-w-9";
      
      const activeClass = isActive 
        ? "bg-blue-600 text-white border-blue-600 shadow-inner" 
        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100";
      
      return `${baseClass} ${sizeClass} ${activeClass}`;
    }
    return isActive ? 'is-active' : '';
  };

  return (
    <div className={toolbarClass}>
      {features?.basicFormatting !== false && (
        <>
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={getButtonClass(editor.isActive('bold'))}
            title="Bold"
          >
            <strong>B</strong>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={getButtonClass(editor.isActive('italic'))}
            title="Italic"
          >
            <em>I</em>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={getButtonClass(editor.isActive('underline'))}
            title="Underline"
          >
            <u>U</u>
          </button>
          <button
            onClick={() => {
              const url = prompt('Enter URL:');
              if (url && isValidLinkUrl(url)) {
                editor.chain().focus().setLink({ href: url }).run();
              } else if (url) {
                alert('Invalid URL');
              }
            }}
            className={getButtonClass(editor.isActive('link'))}
            title="Add Link"
          >
            🔗
          </button>
          <button
            onClick={() => editor.chain().focus().unsetLink().run()}
            disabled={!editor.isActive('link')}
            className={getButtonClass()}
            title="Remove Link"
          >
            🔗×
          </button>
          {features?.advancedFormatting !== false && (
            <>
              <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={getButtonClass(editor.isActive('strike'))}
                title="Strikethrough"
              >
                S
              </button>
              <button
                onClick={() => editor.chain().focus().toggleHighlight().run()}
                className={getButtonClass(editor.isActive('highlight'))}
                title="Highlight"
              >
                H
              </button>
            </>
          )}
        </>
      )}
      
      {features?.advancedFormatting !== false && (
        <CollapsibleSection title="Headings">
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={getButtonClass(editor.isActive('heading', { level: 1 }))}
          >
            H1
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={getButtonClass(editor.isActive('heading', { level: 2 }))}
          >
            H2
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={getButtonClass(editor.isActive('heading', { level: 3 }))}
          >
            H3
          </button>
        </CollapsibleSection>
      )}
      
      {features?.lists !== false && (
        <CollapsibleSection title="Lists">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={getButtonClass(editor.isActive('bulletList'))}
          >
            • List
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={getButtonClass(editor.isActive('orderedList'))}
          >
            1. List
          </button>
        </CollapsibleSection>
      )}
      
      {features?.alignment !== false && (
        <CollapsibleSection title="Alignment">
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={getButtonClass(editor.isActive({ textAlign: 'left' }))}
          >
            ←
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={getButtonClass(editor.isActive({ textAlign: 'center' }))}
          >
            ↔
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={getButtonClass(editor.isActive({ textAlign: 'right' }))}
          >
            →
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={getButtonClass(editor.isActive({ textAlign: 'justify' }))}
          >
            ≡
          </button>
        </CollapsibleSection>
      )}
      
      {features?.colors !== false && (
        <CollapsibleSection title="Colors">
          <div className={useTailwind ? "flex items-center gap-1 ml-2 pl-2 border-l border-gray-300" : "color-controls"}>
            <input
              type="color"
              onInput={(e) => editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()}
              value={editor.getAttributes('textStyle').color || '#000000'}
              className={useTailwind ? "w-7 h-7 border border-gray-300 rounded cursor-pointer" : ""}
            />
            <button
              onClick={() => editor.chain().focus().unsetColor().run()}
              className={useTailwind ? `${getButtonClass()} text-xs py-1 px-2` : "unset-color"}
            >
              Clear
            </button>
          </div>
        </CollapsibleSection>
      )}
      
      {features?.images !== false && (
        <>
          <button
            onClick={() => {
              const url = prompt('Enter image URL:');
              if (url && isValidImageUrl(url)) {
                editor.chain().focus().setImage({ src: url }).run();
              } else if (url) {
                alert('Invalid image URL');
              }
            }}
            className={getButtonClass()}
            title="Insert Image from URL"
          >
            🌐
          </button>
          <button
            onClick={() => {
              // Create a file input element
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  // In a real implementation, you would upload the file to a server
                  // and get a URL back. For now, we'll create a local object URL.
                  const url = URL.createObjectURL(file);
                  editor.chain().focus().setImage({ src: url }).run();
                }
              };
              input.click();
            }}
            className={getButtonClass()}
            title="Upload Image"
          >
            📁
          </button>
        </>
      )}
      
      {features?.tables !== false && (
        <CollapsibleSection title="Tables">
          <div className={useTailwind ? "flex flex-wrap gap-1 ml-2 pl-2 border-l border-gray-300" : "table-controls"}>
            <button
              onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
              className={getButtonClass()}
            >
              Insert Table
            </button>
            <button
              onClick={() => editor.chain().focus().addColumnBefore().run()}
              disabled={!editor.can().addColumnBefore()}
              className={getButtonClass()}
            >
              Add Col Before
            </button>
            <button
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              disabled={!editor.can().addColumnAfter()}
              className={getButtonClass()}
            >
              Add Col After
            </button>
            <button
              onClick={() => editor.chain().focus().deleteColumn().run()}
              disabled={!editor.can().deleteColumn()}
              className={getButtonClass()}
            >
              Delete Column
            </button>
            <button
              onClick={() => editor.chain().focus().addRowBefore().run()}
              disabled={!editor.can().addRowBefore()}
              className={getButtonClass()}
            >
              Add Row Before
            </button>
            <button
              onClick={() => editor.chain().focus().addRowAfter().run()}
              disabled={!editor.can().addRowAfter()}
              className={getButtonClass()}
            >
              Add Row After
            </button>
            <button
              onClick={() => editor.chain().focus().deleteRow().run()}
              disabled={!editor.can().deleteRow()}
              className={getButtonClass()}
            >
              Delete Row
            </button>
            <button
              onClick={() => editor.chain().focus().deleteTable().run()}
              disabled={!editor.can().deleteTable()}
              className={getButtonClass()}
            >
              Delete Table
            </button>
          </div>
        </CollapsibleSection>
      )}
      
      {features?.documentHandling !== false && (
        <CollapsibleSection title="Documents">
          <div className={useTailwind ? "flex flex-wrap gap-1 ml-2 pl-2 border-l border-gray-300 items-center" : "document-controls"}>
            <button
              onClick={async () => {
                try {
                  const content = editor.getHTML();
                  await exportToDocx(content);
                } catch (error: any) {
                  alert('Failed to export DOCX file: ' + (error.message || 'Unknown error occurred'));
                  console.error('DOCX export error:', error);
                }
              }}
              className={getButtonClass()}
            >
              Export DOCX
            </button>
            <button
              onClick={() => {
                const content = editor.getHTML();
                exportToPdf(content);
              }}
              className={getButtonClass()}
            >
              Export PDF
            </button>
            <div className={useTailwind ? "flex gap-1" : "import-controls"}>
              <input
                type="file"
                accept=".doc,.docx"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      const content = await importFromDocx(file);
                      editor.commands.setContent(content);
                    } catch (error: any) {
                      alert('Failed to import DOCX file: ' + (error.message || 'Unknown error occurred'));
                      console.error('DOCX import error:', error);
                    }
                  }
                }}
                style={{ display: 'none' }}
                id="import-docx"
              />
              <label htmlFor="import-docx" className={useTailwind ? `${getButtonClass()} cursor-pointer text-center` : "button"}>
                Import DOCX
              </label>
              
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      const content = await importFromExcel(file);
                      editor.commands.setContent(content);
                    } catch (error: any) {
                      alert('Failed to import Excel file: ' + (error.message || 'Unknown error occurred'));
                      console.error('Excel import error:', error);
                    }
                  }
                }}
                style={{ display: 'none' }}
                id="import-excel"
              />
              <label htmlFor="import-excel" className={useTailwind ? `${getButtonClass()} cursor-pointer text-center` : "button"}>
                Import Excel
              </label>
              
              <input
                type="file"
                accept=".pdf"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      const content = await importFromPdf(file);
                      editor.commands.setContent(content);
                    } catch (error: any) {
                      alert('Failed to import PDF file: ' + (error.message || 'Unknown error occurred'));
                      console.error('PDF import error:', error);
                    }
                  }
                }}
                style={{ display: 'none' }}
                id="import-pdf"
              />
              <label htmlFor="import-pdf" className={useTailwind ? `${getButtonClass()} cursor-pointer text-center` : "button"}>
                Import PDF
              </label>
            </div>
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
};

// Main component
const LjTextArea: React.FC<LjTextAreaProps> = ({
  value = '',
  onChange,
  placeholder = 'Start typing...',
  className = '',
  style = {},
  features = {
    basicFormatting: true,
    advancedFormatting: true,
    lists: true,
    alignment: true,
    colors: true,
    images: true,
    tables: true,
    documentHandling: true
  },
  toolbarMode = 'full',
  useTailwind = false
}) => {
  const [content, setContent] = useState(value);
  const [isClient, setIsClient] = useState(false);

  // Update content when value prop changes
  useEffect(() => {
    setContent(value);
  }, [value]);

  // Set client-side flag to prevent SSR issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Define extensions for the editor
  const extensions = [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3]
      }
    }),
    Placeholder.configure({
      placeholder,
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Highlight,
    Color,
    TextStyle,
    Underline,
    Image,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        rel: 'noopener noreferrer nofollow',
      },
    }),
    FontFamily.configure({
      types: ['textStyle'],
    }),
    Table.configure({
      resizable: true,
    }),
    TableRow,
    TableHeader,
    TableCell,
  ];

  // Handle editor updates
  const handleUpdate = ({ editor }: any) => {
    const html = editor.getHTML();
    setContent(html);
    if (onChange) {
      onChange(html);
    }
  };

  // Determine the main container class based on Tailwind usage
  const containerClass = useTailwind 
    ? `border border-gray-300 rounded shadow-sm ${className}`
    : `lj-text-area ${className}`;

  // Don't render editor on server side to prevent SSR issues
  if (!isClient) {
    return (
      <div className={containerClass} style={style}>
        <div className={useTailwind ? "p-4 text-gray-500" : "loading-placeholder"}>
          Loading editor...
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass} style={style}>
      <EditorProvider
        slotBefore={<Toolbar features={features} toolbarMode={toolbarMode} useTailwind={useTailwind} />}
        extensions={extensions}
        content={content}
        onUpdate={handleUpdate}
        immediatelyRender={false}
      >
      </EditorProvider>
    </div>
  );
};

export default LjTextArea;